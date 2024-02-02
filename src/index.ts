#!/usr/bin/env node
import { program } from "commander";
import {
  CloudWatchClient,
  PutMetricDataCommand,
  PutMetricDataCommandInput,
} from "@aws-sdk/client-cloudwatch";

const client = new CloudWatchClient();

const VALID_STATUSES = new Set(["attempt", "success", "failure"]);

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
      const deployDuration = Number.parseInt(options.deployDuration);
      if (Number.isNaN(deployDuration)) {
        throw new TypeError("Deploy duration must be a number");
      }

      if (!VALID_STATUSES.has(options.status)) {
        throw new TypeError("Invalid status");
      }

      const input: PutMetricDataCommandInput = {
        MetricData: [
          {
            MetricName: `deployment.${options.status}`,
            Dimensions: [
              { Name: "Environment", Value: options.environment },
              { Name: "Project", Value: project },
            ],
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: `deployment.${options.status}`,
            Dimensions: [{ Name: "Environment", Value: options.environment }],
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: `deployment.${options.status}`,
            Dimensions: [{ Name: "Project", Value: project }],
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: `deployment.${options.status}`,
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: "deployment.duration",
            Dimensions: [
              { Name: "Environment", Value: options.environment },
              { Name: "Project", Value: project },
            ],
            Value: deployDuration,
            Unit: "Seconds",
          },
          {
            MetricName: "deployment.duration",
            Dimensions: [{ Name: "Project", Value: project }],
            Value: deployDuration,
            Unit: "Seconds",
          },
          {
            MetricName: "deployment.duration",
            Dimensions: [{ Name: "Environment", Value: options.environment }],
            Value: deployDuration,
            Unit: "Seconds",
          },
          {
            MetricName: "deployment.duration",
            Value: deployDuration,
            Unit: "Seconds",
          },
        ],

        Namespace: "cuckoo",
      };

      await client.send(new PutMetricDataCommand(input));
      console.log("Deployment metrics published to CloudWatch");
      process.exit(0);
    } catch (error) {
      console.error("Error sending metrics to CloudWatch:", error);
      process.exit(1);
    }
  });

program.parse();
