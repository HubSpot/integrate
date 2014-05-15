"""
testrunner.py

Integrate works great locally by running in the browser -
you can simply refresh the page, watch the test run,
and the page will turn red if there is a failure.

In order to run Integrate test in an automated way,
we need to use a script to automate the task
of opening a browser and watching for a failure.

This script does just that, using browserstack's
API (which is based on the python Selenium Driver.)
"""

import os
import logging
import sys
import threading
import multiprocessing.dummy
from optparse import OptionParser
from argparse import ArgumentParser
from uuid import uuid4
import time

import requests
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException

import helpers

log = logging.getLogger(__name__)


def make_driver(testname, retries_left=5):
    desired_cap = {'os': 'Windows', 'os_version': '7', 'browser': 'Chrome'}
    desired_cap['project'] = testname

    try:
        return webdriver.Remote(
            command_executor='http://%s:%s@hub.browserstack.com:80/wd/hub' % ( 
                os.environ['INTEGRATE_BROWSERSTACK_USER'], os.environ['INTEGRATE_BROWSERSTACK_KEY']
            ),
            desired_capabilities=desired_cap
        )
    except WebDriverException, e:
        if not retries_left:
            raise e
        time.sleep(30) # try again in 30 seconds
        return make_driver(testname, retries_left=retries_left-1)


def patch_multiprocessing_pool():
    # Monkey-Patch of this bugfix from 2.7:
    # http://hg.python.org/cpython/rev/1f5d2642929a

    def good_start(self):
        assert self._parent is multiprocessing.dummy.current_process()
        self._start_called = True
        if hasattr(self._parent, '_children'):
            self._parent._children[self] = None
        multiprocessing.dummy.threading.Thread.start(self)

    multiprocessing.dummy.Process.start = good_start


def threadmap(in_func, args, pool_size=5):
    """
    Just like built-in map(), but each item is processed
    by a different (pooled) thread. Recommended for
    simulataneous IO-bound tasks.
    """
    patch_multiprocessing_pool()
    p = multiprocessing.dummy.Pool(pool_size)
    return p.map(in_func, args)


def parse_args():
    parser = ArgumentParser(description="Run some integrate tests.")
    parser.add_argument("testnames", metavar="TESTNAME", type=str, nargs="+", help="name of a test to run.")
    parser.add_argument("-t", "--threads", dest="threads", action="store",
        help="Number of threads to use.", metavar="THREADS", default=1, type=int
    )
    return parser.parse_args()


TEST_PASSED = "TEST_PASSED"
def run_test_at_url(in_args):
    url = in_args['url']
    testname = in_args['testname']
    test_timeout = in_args.get("test_timeout", 120)

    driver = make_driver(testname)
    login_with_driver(driver)
    driver.get(url)
    element = WebDriverWait(driver, test_timeout).until(EC.presence_of_element_located((By.ID, "integrate-test-result")))
    if element.get_attribute("class") != "integrate-test-passed":
        rval = driver.find_element_by_id("integrate-current-step").text
        print "F",
    else:
        rval = TEST_PASSED
        print ".",
    driver.quit()
    return rval


separator = "-" * 80

if __name__ == "__main__":
    options = parse_args()
    print '\n'
    print helpers.ASCII_BANNER
    print "\nThanks a bunch for using Integrate. Let's get this show on the road."
    print "\nYou can run these Integrate tests for yourself by visiting these urls in the browser:\n"

    args = []
    for url in options.testnames:
        print url
        args.append(dict(
            url=url,
            testname=testname
        ))

    print "\nYou can also watch these tests in real time by visiting https://www.browserstack.com/automate ."
    print "\nNow connecting with Browserstack.\nRunning tests in a pool of %s threads:" % options.threads
    sys.stdout.flush()

    results = threadmap(run_test_at_url, args, pool_size=options.threads)
    num_failed = 0
    for args, result in zip(args, results):
        if result != TEST_PASSED:
            print "\n\nTEST FAILURE: %s\n\n%s" % (args['testname'], result)
            num_failed = num_failed + 1 

    print '\n'
    print separator
    if num_failed is 0:
        print "ALL", len(results), "TESTS PASSED.", helpers.random_celebration()
        print '\n'
        sys.stdout.flush()
        sys.exit(0)
    else:
        print "THERE WERE", num_failed, "FAILURES."
        print '\n'
        sys.exit(1)
