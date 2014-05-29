var AnnouncementView;

AnnouncementView = Backbone.View.extend({

  template: require("./announcement.html"),

  initialize: function() {
    this.listenTo(this.collection, "change:selected", this.render, this);
    this.listenTo(this.collection, "warning", this.showWarning, this);
  },

  render: function() {
    var currentAnnouncement;

    currentAnnouncement = this.getCurrentAnnouncement();
    if (currentAnnouncement === null) {
      return this;
    }

    this.$el.html(this.template({
      currentAnnouncement: currentAnnouncement
    }));

    return this;
  },

  getCurrentAnnouncement: function() {
    if (!this.collection.selected) {
      return undefined;
    }

    if (!this.collection.selected.announcement) {
      this.$el.empty();
      return undefined;
    }

    if (_.isFunction(this.collection.selected.announcement)) {
      return this.collection.selected.announcement();
    } else {
      return this.collection.selected.announcement;
    }
  },

  showWarning: function(arg) {
    this.$el.find(".warning").html(arg);
  }
});

module.exports = AnnouncementView;