sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("quality.quality.controller.Dashboard", {
        onInit: function () {
        },

        onNavigation: function (oEvent) {
            var sRoute = oEvent.getSource().data("route");
            if (sRoute) {
                this.getOwnerComponent().getRouter().navTo(sRoute);
            }
        },

        onLogout: function () {
            this.getOwnerComponent().getModel("userModel").setProperty("/isLoggedIn", false);
            this.getOwnerComponent().getRouter().navTo("Login");
        }
    });
});
