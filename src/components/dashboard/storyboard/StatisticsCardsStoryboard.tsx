import React from "react";
import StatisticsCards from "../StatisticsCards";
import { getDashboardStats } from "@/lib/api";

class StatisticsCardsStoryboard extends React.Component {
  state = {
    totalCollections: 0,
    activeCustomers: 0,
    dueCollections: 0,
    collectionRate: 0,
    loading: true,
  };

  componentDidMount() {
    this.fetchData();
    this.intervalId = setInterval(() => this.fetchData(), 5000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async fetchData() {
    try {
      console.log("StatisticsCardsStoryboard fetching data...");
      const stats = await getDashboardStats();
      console.log("Fetched stats:", stats);
      this.setState({
        totalCollections: stats.totalCollections,
        activeCustomers: stats.activeCustomers,
        dueCollections: stats.dueCollections,
        collectionRate: stats.collectionRate,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      totalCollections,
      activeCustomers,
      dueCollections,
      collectionRate,
    } = this.state;

    return (
      <div className="bg-[#0a0e17] p-6">
        <div className="grid grid-cols-4 gap-4">
          <StatisticsCards
            totalCollections={totalCollections}
            activeCustomers={activeCustomers}
            dueCollections={dueCollections}
            collectionRate={collectionRate}
          />
        </div>
      </div>
    );
  }
}

export default StatisticsCardsStoryboard;
