import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class FitonSprint2Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup Chrome
        options = webdriver.ChromeOptions()
        options.add_argument("--start-maximized")
        cls.driver = webdriver.Chrome(options=options)
        cls.wait = WebDriverWait(cls.driver, 10)
        cls.base_url = "https://localhost:4403/"  

    def test_1_measurement_form_validation(self):
        driver = self.driver
        driver.get(f"{self.base_url}/measurements")

        # Locate and fill height input
        height_input = self.wait.until(
            EC.presence_of_element_located((By.NAME, "height"))
        )
        height_input.clear()
        height_input.send_keys("170")

        # Locate and fill weight input
        weight_input = driver.find_element(By.NAME, "weight")
        weight_input.clear()
        weight_input.send_keys("65")

        # Submit form
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Save')]")
        submit_btn.click()

        # Check success message
        success_msg = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-success"))
        )
        self.assertIn("Measurements saved", success_msg.text)

    def test_2_measurement_form_invalid_data(self):
        driver = self.driver
        driver.get(f"{self.base_url}/measurements")

        # Enter invalid height
        height_input = self.wait.until(
            EC.presence_of_element_located((By.NAME, "height"))
        )
        height_input.clear()
        height_input.send_keys("-10")

        # Submit
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Save')]")
        submit_btn.click()

        # Check validation error
        error_msg = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("Height must be positive", error_msg.text)

    def test_3_avatar_generation(self):
        driver = self.driver
        driver.get(f"{self.base_url}/avatar")

        # Click generate avatar button
        generate_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Generate Avatar')]"))
        )
        generate_btn.click()

        # Wait for avatar preview to appear
        avatar_img = self.wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "img"))
        )
        self.assertTrue(avatar_img.get_attribute("src").startswith("data:image"))

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()
