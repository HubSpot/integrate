echo "Compiling Integrate's static assets"
browserify js/test-builder.coffee -t coffeeify | uglifyjs > integrate.min.js
echo "Compiled javascript into integrate.min.js."
compass compile
echo "Compile SASS into stylesheets/style.css."
