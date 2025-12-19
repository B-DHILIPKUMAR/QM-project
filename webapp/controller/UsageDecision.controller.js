sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, JSONModel, History, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("quality.quality.controller.UsageDecision", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("UsageDecision").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPrueflos = oEvent.getParameter("arguments").Prueflos;
            var sPlant = oEvent.getParameter("arguments").Plant;
            this.loadData(sPrueflos, sPlant);
        },

        loadData: function (sPrueflos, sPlant) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            var aFilters = [
                new Filter("Prueflos", FilterOperator.EQ, sPrueflos),
                new Filter("Plant", FilterOperator.EQ, sPlant)
            ];

            oView.setBusy(true);
            oModel.read("/ZQM_USAGESet", {
                filters: aFilters,
                success: function (oData) {
                    oView.setBusy(false);
                    var oRecord = oData.results && oData.results.length > 0 ? oData.results[0] : null;

                    if (oRecord) {
                        var oLocalModel = new JSONModel(oRecord);
                        oView.setModel(oLocalModel);
                    } else {
                        MessageBox.error("No usage decision data found for Lot: " + sPrueflos + " and Plant: " + sPlant);
                    }
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
            if (parseFloat(oData.InspectedQty) !== parseFloat(oData.LotQuantity)) {
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
