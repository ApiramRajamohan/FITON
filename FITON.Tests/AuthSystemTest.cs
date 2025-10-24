using Xunit;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Threading;

namespace FITON.Tests
{
    public class AuthSystemTest : IDisposable
    {
        private IWebDriver driver;

        // Constructor = setup
        public AuthSystemTest()
        {
            var options = new ChromeOptions();
            options.AddArgument("--start-maximized");
            driver = new ChromeDriver(options);
        }

        [Fact]
        public void TestValidLogin()
        {
            driver.Navigate().GoToUrl("https://localhost:4403/login");
            driver.FindElement(By.Name("email")).SendKeys("rapiram83@gmail.com");
            driver.FindElement(By.Name("password")).SendKeys("12345678");
            driver.FindElement(By.CssSelector("button[type='submit']")).Click();

            Thread.Sleep(2000);
            Assert.Contains("dashboard", driver.Url);
        }

        [Fact]
        public void TestInvalidLogin()
        {
            driver.Navigate().GoToUrl("https://localhost:4403/login");
            driver.FindElement(By.Name("email")).SendKeys("wrong@example.com");
            driver.FindElement(By.Name("password")).SendKeys("wrongpass");
            driver.FindElement(By.CssSelector("button[type='submit']")).Click();

            Thread.Sleep(2000);
            var pageSource = driver.PageSource;
            Assert.True(pageSource.Contains("Invalid credentials") || pageSource.Contains("Login failed"));
        }

        // Dispose = teardown
        public void Dispose()
        {
            driver.Quit();
        }
    }
}
