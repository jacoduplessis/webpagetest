from selenium import webdriver
import sys
from utils import human_file_size
from urllib.parse import urlparse

options = webdriver.ChromeOptions()
options.binary_location = '/usr/bin/google-chrome-unstable'
options.add_argument('headless')
options.add_argument('disable-gpu')
options.add_argument('hide-scrollbars')
options.add_argument('window-size=900,600')
driver = webdriver.Chrome(chrome_options=options)

driver.get(sys.argv[1])

perf = driver.execute_script("var performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {}; return performance.getEntries() || {}; ")

total_transferred = 0
for response in perf:
    parsed_url = urlparse(response['name'])

    try:
        total_transferred += response['transferSize']
    except KeyError:
        pass

print("TOTAL TRANSFERRED", human_file_size(total_transferred))
print(driver.page_source)
driver.quit()
