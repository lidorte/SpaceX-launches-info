import * as log from "https://deno.land/std@0.84.0/log/mod.ts";
import * as _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";

interface Lanch {
  flightNumber: number;
  mission: string;
  rocketName: string;
  costumers: Array<string>;
}

interface Payload {
  [key: string]: string;
}

const launches = new Map<number, Lanch>();

export async function downloadLaunchData() {
  log.info("Downloading  launch data...");
  const response = await fetch("https://api.spacexdata.com/v3/launches", {
    method: "GET",
  });

  if (!response.ok) {
    log.warning("Problem downloading  launch data.");
    throw new Error("Lunch data download failed.");
  }

  const launchData = await response.json();
  for (const launch of launchData) {
    const payloads = launch["rocket"]["second_stage"]["payloads"];
    const coustmers = _.flatMap(payloads, (payload: Payload) => {
      return payload["customers"];
    });

    const flightData = {
      flightNumber: launch["flight_number"],
      mission: launch["mission_name"],
      rocketName: launch["rocket"]["rocket_name"],
      costumers: coustmers,
    };

    launches.set(flightData.flightNumber, flightData);
    log.info(JSON.stringify(flightData));
  }
}

if (import.meta.main) {
  await downloadLaunchData();
  log.info(JSON.stringify(import.meta));
  log.info(`Downloaded data for ${launches.size} SpaceX launches`);
}
