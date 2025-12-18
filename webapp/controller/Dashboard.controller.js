sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("quality.quality.controller.Dashboard", {
        onInit: function () {
        },

        onNavigation: function (oEvent) {
            var oSource = oEvent.getSource();
            var sRoute = "";

            // Fallback for data() or getCustomData()
            if (oSource.data("route")) {
                sRoute = oSource.data("route");
            } else {
                var aCustomData = oSource.getCustomData();
                if (aCustomData && aCustomData.length > 0) {
                    sRoute = aCustomData[0].getValue();
                }
            }

            if (sRoute) {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo(sRoute);
            }
        },

        onLogout: function () {
            this.getOwnerComponent().getModel("userModel").setProperty("/isLoggedIn", false);
            this.getOwnerComponent().getRouter().navTo("Login");
        }
    });
});
