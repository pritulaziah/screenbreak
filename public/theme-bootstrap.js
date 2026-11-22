(function () {
  try {
    var theme = localStorage.getItem("screenbreak.theme");
    var appearance = localStorage.getItem("screenbreak.appearance");
    document.documentElement.dataset.theme =
      theme === "cozy" || theme === "night" || theme === "nature"
        ? theme
        : "cozy";
    if (appearance !== "light") {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {
    document.documentElement.dataset.theme = "cozy";
    document.documentElement.classList.add("dark");
  }
})();
