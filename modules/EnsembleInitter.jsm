/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
const EXPORTED_SYMBOLS = ["EnsembleInitter"];

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://ensemble/storage/SQLiteContactStore.jsm");
Cu.import("resource://ensemble/Ensemble.jsm");

let EnsembleInitter = {
  _initted: false,

  init: function() {
    if (!this._initted) {
      let self = this;
      Ensemble.init(SQLiteContactStore).then(function() {
        self._initted = true;
        Services.obs
                .addObserver(self, "quit-application-granted",
                             false);
      }, function(aError) {
        Components.utils.reportError(aError + " -- " + aError.fileName + ":" + aError.lineNumber);
      });
    }
  },

  uninit: function() {
    if (this._initted) {
      let self = this;
      Ensemble.uninit().then(function() {
        Services.obs.removeObserver(self, "quit-application-granted");
        self._initted = false;
      }, function(aError) {
        Components.utils.reportError(aError);
      });
    }
  },

  observe: function(aSubject, aTopic, aData) {
    if (aTopic != "quit-application-granted")
      return;

    this.uninit();
  },
}

if (Services.prefs.getBoolPref("contacts.enable_on_start"))
  EnsembleInitter.init();
