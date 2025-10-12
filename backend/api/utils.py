"""
Utility functions for data processing and aggregation
"""
import pandas as pd
import numpy as np


def clean_data(data):
    """Replace NaN and infinity values with None for JSON serialization"""
    return data.replace([np.inf, -np.inf], np.nan).where(pd.notna(data), None)


def apply_filters(df, filters):
    """
    Apply user-selected filters to the dataframe
    
    Args:
        df: pandas DataFrame
        filters: dict with filter keys (brands, packTypes, ppgs, channels, years)
    
    Returns:
        Filtered DataFrame
    """
    filtered_df = df.copy()
    
    if filters.get('brands') and len(filters['brands']) > 0:
        filtered_df = filtered_df[filtered_df['Brand'].isin(filters['brands'])]
    
    if filters.get('packTypes') and len(filters['packTypes']) > 0:
        filtered_df = filtered_df[filtered_df['PackType'].isin(filters['packTypes'])]
    
    if filters.get('ppgs') and len(filters['ppgs']) > 0:
        filtered_df = filtered_df[filtered_df['PPG'].isin(filters['ppgs'])]
    
    if filters.get('channels') and len(filters['channels']) > 0:
        filtered_df = filtered_df[filtered_df['Channel'].isin(filters['channels'])]
    
    if filters.get('years') and len(filters['years']) > 0:
        filtered_df = filtered_df[filtered_df['Year'].isin(filters['years'])]
    
    return filtered_df


def aggregate_by_dimension(df, dimension, metric='SalesValue'):
    """
    Generic aggregation function by dimension and year
    
    Args:
        df: pandas DataFrame
        dimension: str - column name to group by (e.g., 'Brand', 'PackType')
        metric: str - metric to aggregate (default: 'SalesValue')
    
    Returns:
        Aggregated DataFrame
    """
    result = df.groupby(['Year', dimension]).agg({
        metric: 'sum'
    }).reset_index()
    return result


def aggregate_total_by_year(df, metric='SalesValue'):
    """Aggregate total metric by year"""
    result = df.groupby('Year').agg({
        metric: 'sum'
    }).reset_index()
    return result.sort_values('Year')


def aggregate_market_share(df, dimension):
    """
    Aggregate market share data by dimension
    
    Args:
        df: pandas DataFrame
        dimension: str - column name to group by
    
    Returns:
        DataFrame with SalesValue and Volume aggregated
    """
    result = df.groupby(dimension).agg({
        'SalesValue': 'sum',
        'Volume': 'sum'
    }).reset_index()
    return result.sort_values('SalesValue', ascending=False)


def calculate_kpi_correlation(monthly_trend_df):
    """
    Calculate correlation matrix between KPIs (SalesValue, Volume, ASP)
    
    Args:
        monthly_trend_df: DataFrame with monthly data
    
    Returns:
        List of correlation pairs
    """
    try:
        mt = monthly_trend_df.copy()
        # Calculate ASP (Average Selling Price)
        mt['ASP'] = mt.apply(
            lambda r: (r['SalesValue'] / r['Volume']) 
            if (pd.notna(r['SalesValue']) and pd.notna(r['Volume']) and r['Volume'] not in [0, None]) 
            else np.nan, 
            axis=1
        )
        
        corr = mt[['SalesValue', 'Volume', 'ASP']].corr()
        kpi_order = ['SalesValue', 'Volume', 'ASP']
        correlation_pairs = []
        
        for r in kpi_order:
            for c in kpi_order:
                val = corr.loc[r, c] if (r in corr.index and c in corr.columns) else np.nan
                if pd.notna(val):
                    correlation_pairs.append({'row': r, 'col': c, 'value': float(val)})
        
        return correlation_pairs
    except Exception:
        return []


def calculate_general_correlation(df):
    """
    Calculate correlation between numeric columns
    
    Args:
        df: pandas DataFrame
    
    Returns:
        List of correlation pairs
    """
    corr_columns = []
    
    # Add standard columns
    for col in ['SalesValue', 'Volume', 'VolumeUnits']:
        if col in df.columns:
            corr_columns.append(col)
    
    # Add columns starting with specific prefixes
    for col in df.columns:
        if any(col.startswith(prefix) for prefix in ['D', 'AV', 'EV']):
            if pd.api.types.is_numeric_dtype(df[col]):
                corr_columns.append(col)
    
    # Deduplicate while preserving order
    corr_columns = list(dict.fromkeys(corr_columns))
    correlation_pairs = []
    
    if len(corr_columns) >= 2:
        corr_df = df[corr_columns].corr()
        cols = list(corr_df.columns)
        
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                val = corr_df.iloc[i, j]
                if pd.notna(val):
                    try:
                        correlation_pairs.append({
                            'var1': cols[i], 
                            'var2': cols[j], 
                            'corr': float(val)
                        })
                    except Exception:
                        pass
    
    return correlation_pairs
