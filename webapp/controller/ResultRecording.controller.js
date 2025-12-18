sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, MessageBox, JSONModel, History) {
    "use strict";

    return Controller.extend("quality.quality.controller.ResultRecording", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ResultRecording").attachPatternMatched(this._onObjectMatched, this);

            this.getView().setModel(new JSONModel({}), "resultModel");
        },

        _onObjectMatched: function (oEvent) {
            var sPrueflos = oEvent.getParameter("arguments").Prueflos;
            this._sPrueflos = sPrueflos;
            this.loadData(sPrueflos);
        },

        loadData: function (sPrueflos) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            var sPath = "/ZQM_RESULTSet('" + sPrueflos + "')";

            oView.setBusy(true);
            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    // Determine editability: if UD status is not "Not Decided", make it read-only
                    var bIsEditable = oData.UdStatus === "Not Decided" || !oData.UdStatus;
                    oData.isEditable = bIsEditable;

                    var oLocalModel = new JSONModel(oData);
                    oView.setModel(oLocalModel);
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
            // Assuming ZQM_RESULTSet has properties for these
            var oPayload = {
                Prueflos: oData.Prueflos,
                unrestricted_qty: oData.unrestricted_qty,
                blocked_qty: oData.blocked_qty,
                production_qty: oData.production_qty,
                remarks: oData.remarks
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
