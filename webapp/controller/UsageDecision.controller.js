sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, MessageBox, JSONModel, History) {
    "use strict";

    return Controller.extend("quality.quality.controller.UsageDecision", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("UsageDecision").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPrueflos = oEvent.getParameter("arguments").Prueflos;
            this.loadData(sPrueflos);
        },

        loadData: function (sPrueflos) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            var sPath = "/ZQM_USAGESet('" + sPrueflos + "')";

            oView.setBusy(true);
            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    var oLocalModel = new JSONModel(oData);
                    oView.setModel(oLocalModel);
                },
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to fetch UD details for Lot: " + sPrueflos);
                }
            });
        },

        onSaveDecision: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oData = this.getView().getModel().getData();
            var oView = this.getView();

            // Strict validation check again just in case
            if (parseFloat(oData.inspected_qty) !== parseFloat(oData.total_qty)) {
                MessageBox.error("Total Inspected Quantity must match Lot Quantity.");
                return;
            }

            oView.setBusy(true);

            var oPayload = {
                Prueflos: oData.Prueflos,
                UdCode: oData.UdCode,
                UdRemarks: oData.UdRemarks
            };

            oModel.update("/ZQM_USAGESet('" + oData.Prueflos + "')", oPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Usage Decision saved successfully.");
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to save Usage Decision.");
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("InspectionLot", {}, true);
            }
        }
    });
});
