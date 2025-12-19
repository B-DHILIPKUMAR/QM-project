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

            // Clear previous data
            oView.setModel(new JSONModel({}), "");

            MessageToast.show("Fetching UD: " + sPrueflos + " (" + sPlant + ")");

            var aFilters = [
                new Filter("Prueflos", FilterOperator.EQ, sPrueflos),
                new Filter("Plant", FilterOperator.EQ, sPlant)
            ];

            oView.setBusy(true);
            oModel.read("/ZQM_USAGESet", {
                filters: aFilters,
                success: function (oData) {
                    oView.setBusy(false);
                    var aResults = oData.results || [];
                    var oRecord = null;

                    if (aResults.length > 0) {
                        oRecord = aResults.find(function (r) {
                            return r.Prueflos === sPrueflos && r.Plant === sPlant;
                        });

                        if (!oRecord) {
                            oRecord = aResults.find(function (r) {
                                return r.Prueflos === sPrueflos;
                            });
                        }
                    }

                    if (oRecord) {
                        var oLocalModel = new JSONModel(oRecord);
                        oView.setModel(oLocalModel);
                    } else {
                        // Fallback: Fetch basic info from Inspection Lot header
                        this._fetchLotHeaderInfo(sPrueflos, sPlant);
                    }
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    this._fetchLotHeaderInfo(sPrueflos, sPlant);
                }.bind(this)
            });
        },

        _fetchLotHeaderInfo: function (sPrueflos, sPlant) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            var aFilters = [
                new Filter("Prueflos", FilterOperator.EQ, sPrueflos),
                new Filter("Plant", FilterOperator.EQ, sPlant)
            ];

            oModel.read("/ZQM_INSPECTIONSet", {
                filters: aFilters,
                success: function (oData) {
                    oView.setBusy(false);
                    var aResults = oData.results || [];
                    var oLot = null;

                    if (aResults.length > 0) {
                        oLot = aResults.find(function (r) {
                            return r.Prueflos === sPrueflos;
                        });
                    }

                    if (oLot) {
                        var oNewRecord = {
                            Prueflos: oLot.Prueflos,
                            MaterialNumber: oLot.MaterialNumber,
                            Plant: oLot.Plant,
                            LotQuantity: oLot.LotQuantity,
                            InspectedQty: "0",
                            Uom: oLot.Uom
                        };
                        oView.setModel(new JSONModel(oNewRecord));
                    } else {
                        MessageBox.error("Lot " + sPrueflos + " not found in system.");
                    }
                },
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Failed to fetch Lot details for: " + sPrueflos);
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
