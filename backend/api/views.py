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
        
        # Convert to JSON-serializable format
        def clean_data(data):
            """Replace NaN and infinity values with None"""
            return data.replace([np.inf, -np.inf], np.nan).where(pd.notna(data), None)
        
        return Response({
            'salesByYear': clean_data(sales_by_year).to_dict('records'),
            'volumeByYear': clean_data(volume_by_year).to_dict('records'),
            'salesByBrandYear': clean_data(sales_by_brand_year).to_dict('records'),
            'volumeByBrandYear': clean_data(volume_by_brand_year).to_dict('records'),
            'monthlyTrend': clean_data(monthly_trend).to_dict('records'),
            'marketShareSales': clean_data(market_share_sales).to_dict('records'),
            'yearBrandSales': clean_data(year_brand_sales).to_dict('records')
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

