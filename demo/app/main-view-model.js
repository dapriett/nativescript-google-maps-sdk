const Observable = require("@nativescript/core").Observable;

function createViewModel() {
    const viewModel = new Observable();

    viewModel.latitude = -33.86;
    viewModel.longitude = 151.20;
    viewModel.zoom = 8;
    viewModel.minZoom = 0;
    viewModel.maxZoom =  22;
    viewModel.bearing = 180;
    viewModel.tilt = 35;
    viewModel.padding = [80, 40, 40, 40];
    viewModel.mapAnimationsEnabled = true;

    return viewModel;
}

exports.createViewModel = createViewModel;
