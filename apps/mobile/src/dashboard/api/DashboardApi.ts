import { DashboardController } from "../DashboardController.js";

export class DashboardApi {

    private readonly controller = new DashboardController();

    public status() {

        return this.controller.getDashboard();

    }

}
