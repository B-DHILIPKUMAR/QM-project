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

    return Controller.extend("quality.quality.controller.ResultRecording", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ResultRecording").attachPatternMatched(this._onObjectMatched, this);

            this.getView().setModel(new JSONModel({}), "resultModel");
        },

        _onObjectMatched: function (oEvent) {
            var sPrueflos = oEvent.getParameter("arguments").Prueflos;
            var sPlant = oEvent.getParameter("arguments").Plant;
            this._sPrueflos = sPrueflos;
            this._sPlant = sPlant;
            this.loadData(sPrueflos, sPlant);
        },

        loadData: function (sPrueflos, sPlant) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();

            // Clear current data so user sees it's loading fresh
            oView.setModel(new JSONModel({}), "unnamed");
            oView.setModel(new JSONModel({}), "");

            MessageToast.show("Fetching Log: " + sPrueflos + " (" + sPlant + ")");

            var aFilters = [
                new Filter("Prueflos", FilterOperator.EQ, sPrueflos),
                new Filter("Plant", FilterOperator.EQ, sPlant)
            ];

            oView.setBusy(true);
            oModel.read("/ZQM_RESULTSet", {
                filters: aFilters,
                success: function (oData) {
                    oView.setBusy(false);
                    var oRecord = oData.results && oData.results.length > 0 ? oData.results[0] : null;

                    if (oRecord) {
                        // Determine editability: if Status is 'X', it might mean locked/decided
                        var bIsEditable = oRecord.Status !== "X";
                        oRecord.isEditable = bIsEditable;

                        var oLocalModel = new JSONModel(oRecord);
                        oView.setModel(oLocalModel);
                    } else {
                        MessageBox.error("No record found for Lot: " + sPrueflos + " and Plant: " + sPlant);
                    }
                },
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to fetch results for Lot: " + sPrueflos);
                }
            });
        },

        onSave: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oData = this.getView().getModel().getData();
            var oView = this.getView();

            oView.setBusy(true);

            // Prepare payload for update/create
            var oPayload = {
                Prueflos: oData.Prueflos,
                UnrestrictedQty: oData.UnrestrictedQty,
                BlockedQty: oData.BlockedQty,
                ProductionQty: oData.ProductionQty,
                Remarks: oData.Remarks
            };

            oModel.update("/ZQM_RESULTSet('" + oData.Prueflos + "')", oPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Results saved successfully.");
                },
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to save results.");
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
