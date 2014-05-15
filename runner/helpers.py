import random
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.errorhandler import ElementNotVisibleException, \
                                       NoSuchElementException, \
                                       NoAlertPresentException, \
                                       UnexpectedAlertPresentException

ASCII_BANNER = """
  _           _                                   _          
 (_)         | |                                 | |         
  _   _ __   | |_    ___    __ _   _ __    __ _  | |_    ___ 
 | | | '_ \  | __|  / _ \  / _` | | '__|  / _` | | __|  / _ \\
 | | | | | | | |_  |  __/ | (_| | | |    | (_| | | |_  |  __/
 |_| |_| |_|  \__|  \___|  \__, | |_|     \__,_|  \__|  \___|
                            __/ |                            
                           |___/                             
"""


def random_celebration():
    return random.choice((
        "yesssssssss",
        "All right!",
        "You did it!",
        "Please, there's no need to thank me.",
        "You're a star!",
        "This is awesome.",
        "Always remember this moment.",
        "Until next time.",
        "Congratulations.",
        "<3 <3 <3",
        "It has been a pleasure testing with you.",
        "You put the \"great\" in Integrate.",
        "YOU WON THIS TIME"
    ))


def wait_for_element_visible(driver, selector,
                             by=By.CSS_SELECTOR, timeout=30):
    """
    Searches for the specified element by the given selector.  Returns the
    element object if the element is present and visible on the page.
    Raises an exception if the element does not appear in the
    specified timeout.
    @Params
    driver - the webdriver object (required)
    selector - the locator that is used (required)
    by - the method to search for hte locator (Default- By.CSS_SELECTOR)
    timeout - the time to wait for the element in seconds (Default- 30 seconds)

    @returns
    A web element object
    """

    element = None
    for x in range(timeout):
        try:
            element = driver.find_element(by=by, value=selector)
            if element.is_displayed():
                return element
            else:
                element = None
            time.sleep(1)
        except Exception:
            time.sleep(1)
    if not element:
        raise ElementNotVisibleException("Element %s was not visible in %s seconds!"\
                                         % (selector, timeout))