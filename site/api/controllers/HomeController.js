module.exports = {
  index: function(req, res) {
    res.view({
      layout:null
    });
  },

  login: function(req,  res) {
    res.view({
      layout:null
    });
  },

  reset: function(req,  res) {

    sailsTokenAuth.decode(req.param('token') || "").then(function(data){
      console.log("sailsTokenAuth.decode: ", data);

      res.view({
        layout:null,
        user: data,
        varify: true
      });

    }).catch(function(){
      res.view({
        layout:null,
        varify: false
      });
    });
  }

};
