# backend/performance_tests/analyze_results.py
import json
from datetime import datetime

def analyze_performance_results():
    # 读取测试结果
    try:
        with open('performance_results.json', 'r') as f:
            results = json.load(f)
    except FileNotFoundError:
        print('未找到 performance_results.json')
        return
    # 打印分析时间戳
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n性能分析报告（{timestamp}）")
    
    # 分析数据库性能
    db_metrics = results.get('query_performance', {})
    if db_metrics:
        print("\n数据库性能分析:")
        print("=" * 50)
        print(f"基础查询时间: {db_metrics.get('basic_query_time', 0):.6f}秒")
        print(f"过滤查询时间: {db_metrics.get('filtered_query_time', 0):.6f}秒")
        print(f"关联查询时间: {db_metrics.get('join_query_time', 0):.6f}秒")
        print(f"复杂查询时间: {db_metrics.get('complex_query_time', 0):.6f}秒")
    else:
        print("未找到数据库性能数据 (query_performance)")
    
    # 分析API性能
    api_metrics = results.get('api_performance', {})
    if api_metrics:
        print("\nAPI性能分析:")
        print("=" * 50)
        print(f"旅游规划列表API响应时间: {api_metrics.get('travel_plan_list_time', 0):.6f}秒")
        print(f"攻略搜索API响应时间: {api_metrics.get('guide_search_time', 0):.6f}秒")
        print(f"攻略详情API响应时间: {api_metrics.get('guide_detail_time', 0):.6f}秒")
    else:
        print("未找到 API 性能数据 (api_performance)")
    
    # 分析并发性能
    concurrency_metrics = results.get('concurrency', {})
    if concurrency_metrics:
        print("\n并发性能分析:")
        print("=" * 50)
        print(f"100个并发请求总耗时: {concurrency_metrics.get('total_time', 0):.6f}秒")
        print(f"系统TPS: {concurrency_metrics.get('tps', 0):.2f}")
    else:
        print("未找到并发性能数据 (concurrency)")

if __name__ == '__main__':
    analyze_performance_results()