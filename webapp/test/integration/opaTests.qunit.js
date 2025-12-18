/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["quality/quality/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
