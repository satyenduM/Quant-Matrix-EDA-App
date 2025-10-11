"""
API views for the EDA application.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from .data_loader import data_loader
import numpy as np


@api_view(['GET'])
def get_filter_options(request):
    """
    Get all available filter options (brands, pack types, PPG, channels, years)
    """
    try:
        df = data_loader.get_data()
        
        # Get unique values for each filter, excluding 'All*' values and NaN
        brands = sorted([b for b in df['Brand'].unique() if pd.notna(b) and not str(b).startswith('All')])
        pack_types = sorted([p for p in df['PackType'].unique() if pd.notna(p) and not str(p).startswith('All')])
        ppgs = sorted([p for p in df['PPG'].unique() if pd.notna(p) and not str(p).startswith('All')])
        channels = sorted([c for c in df['Channel'].unique() if pd.notna(c) and not str(c).startswith('All')])
        years = sorted([int(y) for y in df['Year'].unique() if pd.notna(y)])
        
        return Response({
            'brands': brands,
            'packTypes': pack_types,
            'ppgs': ppgs,
            'channels': channels,
            'years': years
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def get_filtered_data(request):
    """
    Get filtered and aggregated data based on user selections.
    """
    try:
        df = data_loader.get_data().copy()
        filters = request.data.get('filters', {})
        
        # Apply filters
        if filters.get('brands') and len(filters['brands']) > 0:
            df = df[df['Brand'].isin(filters['brands'])]
        
        if filters.get('packTypes') and len(filters['packTypes']) > 0:
            df = df[df['PackType'].isin(filters['packTypes'])]
        
        if filters.get('ppgs') and len(filters['ppgs']) > 0:
            df = df[df['PPG'].isin(filters['ppgs'])]
        
        if filters.get('channels') and len(filters['channels']) > 0:
            df = df[df['Channel'].isin(filters['channels'])]
        
        if filters.get('years') and len(filters['years']) > 0:
            df = df[df['Year'].isin(filters['years'])]
        
        # Aggregate data for different chart types
        
        # 1. Sales Value by Year (Horizontal Bar Chart)
        sales_by_year = df.groupby('Year').agg({
            'SalesValue': 'sum'
        }).reset_index()
        sales_by_year = sales_by_year.sort_values('Year')
        
        # 2. Volume by Year (Horizontal Bar Chart)
        volume_by_year = df.groupby('Year').agg({
            'Volume': 'sum'
        }).reset_index()
        volume_by_year = volume_by_year.sort_values('Year')
        
        # 3. Sales Value by Brand and Year (for stacked bar chart)
        sales_by_brand_year = df.groupby(['Year', 'Brand']).agg({
            'SalesValue': 'sum'
        }).reset_index()
        
        # 4. Volume by Brand and Year
        volume_by_brand_year = df.groupby(['Year', 'Brand']).agg({
            'Volume': 'sum'
        }).reset_index()
        
        # 5. Monthly trend (Line Chart)
        df['YearMonth'] = df['Year'].astype(str) + '-' + df['Month'].astype(str).str.zfill(2)
        monthly_trend = df.groupby(['Year', 'Month', 'YearMonth']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum',
            'date': 'first'
        }).reset_index()
        monthly_trend = monthly_trend.sort_values(['Year', 'Month'])

        # 5b. KPI correlation matrix across monthly KPIs (SalesValue, Volume, ASP)
        kpi_correlation = []
        try:
            mt = monthly_trend.copy()
            mt['ASP'] = mt.apply(lambda r: (r['SalesValue'] / r['Volume']) if (pd.notna(r['SalesValue']) and pd.notna(r['Volume']) and r['Volume'] not in [0, None]) else np.nan, axis=1)
            corr = mt[['SalesValue', 'Volume', 'ASP']].corr()
            kpi_order = ['SalesValue', 'Volume', 'ASP']
            for r in kpi_order:
                for c in kpi_order:
                    val = corr.loc[r, c] if (r in corr.index and c in corr.columns) else np.nan
                    if pd.notna(val):
                        kpi_correlation.append({'row': r, 'col': c, 'value': float(val)})
        except Exception as _:
            kpi_correlation = []

        # 5c. Monthly brand sales (for potential market share trends)
        monthly_brand_sales = df.groupby(['Year', 'Month', 'YearMonth', 'Brand']).agg({
            'SalesValue': 'sum'
        }).reset_index().sort_values(['Year', 'Month', 'Brand'])
        
        # 6. Market Share by Brand (Pie/Donut Chart)
        market_share_sales = df.groupby('Brand').agg({
            'SalesValue': 'sum',
            'Volume': 'sum'
        }).reset_index()
        market_share_sales = market_share_sales.sort_values('SalesValue', ascending=False)
        
        # 7. Year-wise Sales Value by Brand (Vertical Bar Chart)
        year_brand_sales = df.groupby(['Brand', 'Year']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Additional datasets for view modes
        # Sales by PackType and Year
        sales_by_packtype_year = df.groupby(['Year', 'PackType']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Sales by PPG and Year
        sales_by_ppg_year = df.groupby(['Year', 'PPG']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Add Combo label for combinations
        df['Combo'] = (df['Brand'].astype(str).fillna('') + ' · ' +
                       df['PackType'].astype(str).fillna('') + ' · ' +
                       df['PPG'].astype(str).fillna(''))

        # Sales by Combo and Year
        sales_by_combo_year = df.groupby(['Year', 'Brand', 'PackType', 'PPG', 'Combo']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Volume variants
        volume_by_packtype_year = df.groupby(['Year', 'PackType']).agg({
            'Volume': 'sum'
        }).reset_index()

        volume_by_ppg_year = df.groupby(['Year', 'PPG']).agg({
            'Volume': 'sum'
        }).reset_index()

        volume_by_combo_year = df.groupby(['Year', 'Brand', 'PackType', 'PPG', 'Combo']).agg({
            'Volume': 'sum'
        }).reset_index()

        # Year-wise sales by other dimensions (for vertical grouped bars)
        year_packtype_sales = df.groupby(['PackType', 'Year']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        year_ppg_sales = df.groupby(['PPG', 'Year']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        year_combo_sales = df.groupby(['Brand', 'PackType', 'PPG', 'Combo', 'Year']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Market share variants
        market_share_packtype = df.groupby('PackType').agg({
            'SalesValue': 'sum',
            'Volume': 'sum'
        }).reset_index()

        market_share_ppg = df.groupby('PPG').agg({
            'SalesValue': 'sum',
            'Volume': 'sum'
        }).reset_index()

        market_share_combo = df.groupby(['Brand', 'PackType', 'PPG', 'Combo']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum'
        }).reset_index()

        # Basic correlation matrix between available numeric fields
        corr_columns = []
        for col in ['SalesValue', 'Volume', 'VolumeUnits']:
            if col in df.columns:
                corr_columns.append(col)
        for col in df.columns:
            if any(col.startswith(prefix) for prefix in ['D', 'AV', 'EV']):
                if pd.api.types.is_numeric_dtype(df[col]):
                    corr_columns.append(col)
        corr_columns = list(dict.fromkeys(corr_columns))  # dedupe while preserving order
        correlation_pairs = []
        if len(corr_columns) >= 2:
            corr_df = df[corr_columns].corr()
            cols = list(corr_df.columns)
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    val = corr_df.iloc[i, j]
                    if pd.notna(val):
                        try:
                            correlation_pairs.append({'var1': cols[i], 'var2': cols[j], 'corr': float(val)})
                        except Exception:
                            pass
        
        # Convert to JSON-serializable format
        def clean_data(data):
            """Replace NaN and infinity values with None"""
            return data.replace([np.inf, -np.inf], np.nan).where(pd.notna(data), None)
        
        return Response({
            'salesByYear': clean_data(sales_by_year).to_dict('records'),
            'volumeByYear': clean_data(volume_by_year).to_dict('records'),

            'salesByBrandYear': clean_data(sales_by_brand_year).to_dict('records'),
            'volumeByBrandYear': clean_data(volume_by_brand_year).to_dict('records'),

            'salesByPackTypeYear': clean_data(sales_by_packtype_year).to_dict('records'),
            'salesByPPGYear': clean_data(sales_by_ppg_year).to_dict('records'),
            'salesByComboYear': clean_data(sales_by_combo_year).to_dict('records'),

            'volumeByPackTypeYear': clean_data(volume_by_packtype_year).to_dict('records'),
            'volumeByPPGYear': clean_data(volume_by_ppg_year).to_dict('records'),
            'volumeByComboYear': clean_data(volume_by_combo_year).to_dict('records'),

            'monthlyTrend': clean_data(monthly_trend).to_dict('records'),
            'kpiCorrelation': kpi_correlation,
            'monthlyBrandSales': clean_data(monthly_brand_sales).to_dict('records'),

            'marketShareSales': clean_data(market_share_sales).to_dict('records'),
            'marketSharePackType': clean_data(market_share_packtype).to_dict('records'),
            'marketSharePPG': clean_data(market_share_ppg).to_dict('records'),
            'marketShareCombo': clean_data(market_share_combo).to_dict('records'),

            'yearBrandSales': clean_data(year_brand_sales).to_dict('records'),
            'yearPackTypeSales': clean_data(year_packtype_sales).to_dict('records'),
            'yearPPGSales': clean_data(year_ppg_sales).to_dict('records'),
            'yearComboSales': clean_data(year_combo_sales).to_dict('records'),

            'correlationMatrix': correlation_pairs
        })
    except Exception as e:
        print(f"Error in get_filtered_data: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint
    """
    return Response({'status': 'ok', 'message': 'EDA API is running'})

