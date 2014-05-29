echo "Compiling Integrate's static assets"
browserify js/test-builder.coffee -t coffeeify -t node-underscorify > integrate.js
echo "Compiled unminified to integrate.js"
browserify js/test-builder.coffee -t coffeeify -t node-underscorify | uglifyjs > integrate.min.js
echo "Compiled javascript into integrate.min.js."
compass compile
echo "Compile SASS into stylesheets/style.css."
