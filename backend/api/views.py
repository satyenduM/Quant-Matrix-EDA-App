"""
API views for the EDA application.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import logging
from .data_loader import data_loader
from .utils import (
    apply_filters, clean_data, aggregate_by_dimension,
    aggregate_total_by_year, aggregate_market_share,
    calculate_kpi_correlation, calculate_general_correlation
)

logger = logging.getLogger(__name__)


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
        logger.error(f"Error fetching filter options: {e}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def get_filtered_data(request):
    """
    Get filtered and aggregated data based on user selections.
    """
    try:
        df = data_loader.get_data().copy()
        filters = request.data.get('filters', {})
        
        # Apply filters using utility function
        df = apply_filters(df, filters)
        
        # Aggregate data for different chart types
        
        # 1. Sales Value by Year
        sales_by_year = aggregate_total_by_year(df, 'SalesValue')
        
        # 2. Volume by Year
        volume_by_year = aggregate_total_by_year(df, 'Volume')
        
        # 3. Sales Value by Brand and Year
        sales_by_brand_year = aggregate_by_dimension(df, 'Brand', 'SalesValue')
        
        # 4. Volume by Brand and Year
        volume_by_brand_year = aggregate_by_dimension(df, 'Brand', 'Volume')
        
        # 5. Monthly trend (Line Chart)
        df['YearMonth'] = df['Year'].astype(str) + '-' + df['Month'].astype(str).str.zfill(2)
        monthly_trend = df.groupby(['Year', 'Month', 'YearMonth']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum',
            'date': 'first'
        }).reset_index()
        monthly_trend = monthly_trend.sort_values(['Year', 'Month'])

        # 5b. KPI correlation matrix across monthly KPIs (SalesValue, Volume, ASP)
        kpi_correlation = calculate_kpi_correlation(monthly_trend)

        # 5c. Monthly brand sales (for potential market share trends)
        monthly_brand_sales = df.groupby(['Year', 'Month', 'YearMonth', 'Brand']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum',
            'date': 'first'
        }).reset_index().sort_values(['Year', 'Month', 'Brand'])
        
        # 5d. Monthly channel sales
        monthly_channel_sales = df.groupby(['Year', 'Month', 'YearMonth', 'Channel']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum',
            'date': 'first'
        }).reset_index().sort_values(['Year', 'Month', 'Channel'])
        
        # 6. Market Share by Brand
        market_share_sales = aggregate_market_share(df, 'Brand')
        
        # 7. Year-wise Sales Value by Brand (Vertical Bar Chart)
        year_brand_sales = df.groupby(['Brand', 'Year']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Additional datasets for view modes
        sales_by_packtype_year = aggregate_by_dimension(df, 'PackType', 'SalesValue')
        sales_by_ppg_year = aggregate_by_dimension(df, 'PPG', 'SalesValue')

        # Add Combo label for combinations
        df['Combo'] = (df['Brand'].astype(str).fillna('') + ' · ' +
                       df['PackType'].astype(str).fillna('') + ' · ' +
                       df['PPG'].astype(str).fillna(''))

        # Sales by Combo and Year
        sales_by_combo_year = df.groupby(['Year', 'Brand', 'PackType', 'PPG', 'Combo']).agg({
            'SalesValue': 'sum'
        }).reset_index()

        # Volume variants
        volume_by_packtype_year = aggregate_by_dimension(df, 'PackType', 'Volume')
        volume_by_ppg_year = aggregate_by_dimension(df, 'PPG', 'Volume')

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
        market_share_packtype = aggregate_market_share(df, 'PackType')
        market_share_ppg = aggregate_market_share(df, 'PPG')

        market_share_combo = df.groupby(['Brand', 'PackType', 'PPG', 'Combo']).agg({
            'SalesValue': 'sum',
            'Volume': 'sum'
        }).reset_index()

        # Basic correlation matrix between available numeric fields
        correlation_pairs = calculate_general_correlation(df)

        # KPI summary stats computed over the filtered dataset
        kpi_stats = {
            'value': {
                'sum': float(df['SalesValue'].sum()),
                'average': float(df['SalesValue'].mean()) if len(df) > 0 else 0.0,
                'min': float(df['SalesValue'].min()) if len(df) > 0 else 0.0,
                'max': float(df['SalesValue'].max()) if len(df) > 0 else 0.0,
                'count': int(df['SalesValue'].count()),
            },
            'volume': {
                'sum': float(df['Volume'].sum()),
                'average': float(df['Volume'].mean()) if len(df) > 0 else 0.0,
                'min': float(df['Volume'].min()) if len(df) > 0 else 0.0,
                'max': float(df['Volume'].max()) if len(df) > 0 else 0.0,
                'count': int(df['Volume'].count()),
            }
        }

        return Response({
            'salesByYear': clean_data(sales_by_year).to_dict('records'),
            'volumeByYear': clean_data(volume_by_year).to_dict('records'),
            'kpiStats': kpi_stats,

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
            'monthlyChannelSales': clean_data(monthly_channel_sales).to_dict('records'),

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
        logger.error(f"Error in get_filtered_data: {e}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint
    """
    return Response({'status': 'ok', 'message': 'Application is running'})

