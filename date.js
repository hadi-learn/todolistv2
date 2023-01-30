//jshint esversion:6

exports.getDate = function() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);

};

exports.getDay = function () {

  const today = new Date();

  const options = {
    weekday: "long"
  };

  return today.toLocaleDateString("en-US", options);

};

exports.getYear = function () {
  let today = new Date()
  let options = {
      year: 'numeric',
  }

  let year = today.toLocaleDateString('en-US', options)

  return year
}
