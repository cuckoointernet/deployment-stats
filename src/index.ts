#!/usr/bin/env node
import { program } from "commander";
import {
  CloudWatchClient,
  PutMetricDataCommand,
  PutMetricDataCommandInput,
} from "@aws-sdk/client-cloudwatch";

const client = new CloudWatchClient();

program
  .name("deployment-stats")
  .description("CLI to push statsd metrics to CloudWatch");

program
  .command("deployment")
  .argument("<project>")
  .option("-s, --status <status>", "Deployment status")
  .option("-e, --environment <environment>", "Deployment environment")
  .option("-d --deploy-duration <deploy-duration>", "Deployment duration")
  .action(async (project, options) => {
    try {
      // Validate deploy duration as a number
      const deployDuration = parseInt(options.deployDuration);
      if (isNaN(deployDuration)) {
        throw new Error("Deploy duration must be a number");
      }

      const input: PutMetricDataCommandInput = {
        MetricData: [
          {
            MetricName: "DeploymentStatus",
            Dimensions: [
              { Name: "Environment", Value: options.environment },
              { Name: "Project", Value: project },
              { Name: "Status", Value: options.status },
            ],
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: "DeploymentDuration",
            Dimensions: [
              { Name: "Environment", Value: options.environment },
              { Name: "Project", Value: project },
            ],
            Value: deployDuration,
            Unit: "Seconds",
          },
        ],

        Namespace: "cuckoo",
      };

      await client.send(new PutMetricDataCommand(input));
      console.log("Deployment metrics published to CloudWatch");
    } catch (error) {
      console.error("Error sending metrics to CloudWatch:", error);
    }
  });

program.parse();
