sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History"
], function (Controller, Filter, FilterOperator, History) {
    "use strict";

    return Controller.extend("quality.quality.controller.InspectionLot", {
        onInit: function () {
        },

        onSearch: function () {
            var sPlant = this.byId("filterPlant").getValue();
            var sLot = this.byId("filterLot").getValue();
            var aFilters = [];

            if (sPlant) {
                aFilters.push(new Filter("Werks", FilterOperator.Contains, sPlant));
            }
            if (sLot) {
                aFilters.push(new Filter("Prueflos", FilterOperator.Contains, sLot));
            }

            var oTable = this.byId("inspectionLotTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onRecordResults: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var sPrueflos = oItem.getBindingContext().getProperty("Prueflos");
            this.getOwnerComponent().getRouter().navTo("ResultRecording", {
                Prueflos: sPrueflos
            });
        },

        onUsageDecision: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var sPrueflos = oItem.getBindingContext().getProperty("Prueflos");
            this.getOwnerComponent().getRouter().navTo("UsageDecision", {
                Prueflos: sPrueflos
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("Dashboard", {}, true);
            }
        }
    });
});
