# backend/performance_tests/generate_report.py
import json
from datetime import datetime
import os
import matplotlib.pyplot as plt
import seaborn as sns
from jinja2 import Template

def load_results():
    """加载 JSON 结果文件"""
    try:
        with open('performance_results.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print('未找到 performance_results.json')
        return {}

class PerformanceReportGenerator:
    def __init__(self, results):
        self.results = results
        sns.set_style('whitegrid')
        plt.rcParams['font.sans-serif'] = ['SimHei']
        plt.rcParams['axes.unicode_minus'] = False

    def _plot_bar(self, data, title, filename, xlabel, ylabel):
        plt.figure(figsize=(8, 5))
        sns.barplot(x=list(data.keys()), y=list(data.values()))
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(filename)
        plt.close()

    def generate_charts(self):
        # 数据库性能
        db = self.results.get('query_performance', {})
        if db:
            self._plot_bar(db, '数据库查询性能', 'database_performance.png', '查询类型', '时间(秒)')
        # API 性能
        api = self.results.get('api_performance', {})
        if api:
            self._plot_bar(api, 'API 响应性能', 'api_performance.png', 'API 类型', '时间(秒)')
        # 并发性能
        conc = self.results.get('concurrency', {})
        if conc:
            self._plot_bar(conc, '并发性能', 'concurrency_performance.png', '指标', '值')

    def generate_html_report(self):
        template_str = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>性能测试报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #333; }
    .chart { margin: 20px 0; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; }
    th { background: #f2f2f2; }
  </style>
</head>
<body>
  <h1>性能测试报告</h1>
  <p>生成时间：{{ timestamp }}</p>

  {% if query_performance %}
  <h2>数据库性能</h2>
  <div class="chart"><img src="database_performance.png" alt="数据库性能图"></div>
  <table>
    <tr><th>查询</th><th>时间(秒)</th></tr>
    {% for k,v in query_performance.items() %}
    <tr><td>{{ k }}</td><td>{{ '%.6f'|format(v) }}</td></tr>
    {% endfor %}
  </table>
  {% endif %}

  {% if api_performance %}
  <h2>API 性能</h2>
  <div class="chart"><img src="api_performance.png" alt="API性能图"></div>
  <table>
    <tr><th>接口</th><th>时间(秒)</th></tr>
    {% for k,v in api_performance.items() %}
    <tr><td>{{ k }}</td><td>{{ '%.6f'|format(v) }}</td></tr>
    {% endfor %}
  </table>
  {% endif %}

  {% if concurrency %}
  <h2>并发性能</h2>
  <div class="chart"><img src="concurrency_performance.png" alt="并发性能图"></div>
  <table>
    <tr><th>指标</th><th>值</th></tr>
    {% for k,v in concurrency.items() %}
    <tr><td>{{ k }}</td><td>{{ '%.6f'|format(v) }}</td></tr>
    {% endfor %}
  </table>
  {% endif %}
</body>
</html>
'''        
        tpl = Template(template_str)
        html = tpl.render(
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            query_performance=self.results.get('query_performance', {}),
            api_performance=self.results.get('api_performance', {}),
            concurrency=self.results.get('concurrency', {})
        )
        with open('performance_report.html', 'w', encoding='utf-8') as f:
            f.write(html)

if __name__ == '__main__':
    results = load_results()
    gen = PerformanceReportGenerator(results)
    gen.generate_charts()
    gen.generate_html_report()
    print('性能报告生成完毕，文件：performance_report.html')