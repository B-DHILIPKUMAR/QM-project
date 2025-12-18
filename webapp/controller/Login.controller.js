sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("quality.quality.controller.Login", {
        onInit: function () {
            // Initialize local model for login inputs if needed, or use the one from manifest
        },

        onLogin: function () {
            var oView = this.getView();
            var sUserId = oView.byId("userId").getValue();
            var sPassword = oView.byId("password").getValue();

            if (!sUserId || !sPassword) {
                MessageToast.show("Please enter both User ID and Password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            var that = this;

            oView.setBusy(true);

            // ZQM_LOGINSet(UserId='<UserId>',Password='<Password>')
            var sPath = "/ZQM_LOGINSet(UserId='" + sUserId + "',Password='" + sPassword + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    // Assuming success response means valid login (can check oData properties if needed)
                    if (oData) {
                        MessageToast.show("Login Successful!");
                        oUserModel.setProperty("/UserId", sUserId);
                        oUserModel.setProperty("/isLoggedIn", true);

                        // Navigate to Dashboard
                        that.getOwnerComponent().getRouter().navTo("Dashboard");
                    } else {
                        MessageBox.error("Invalid Credentials. Please try again.");
                    }
                },
                error: function (oError) {
                    oView.setBusy(false);
                    var sMsg = "Login Failed";
                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMsg = oResponse.error.message.value;
                    } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        }
    });
});
