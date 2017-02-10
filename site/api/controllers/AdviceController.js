module.exports = {
  index: function(req, res) {
    Advice.find()
    .then(function(result) {
      res.json(result);
    });
  },

  create: function(req, res) {
    Advice.create({advice: req.body.advice})
    .then(function(record) {
      if (record != undefined) {
        res.json(200, 'create advice ok:'+record.advice);
      }
    });

  },
}
