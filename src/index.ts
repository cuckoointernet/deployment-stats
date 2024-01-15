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
  .option("-s, --status <status>")
  .option("-e, --environment <environment>")
  .action(async (project, options) => {
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
      ],
      Namespace: "cuckoo",
    };
    await client.send(new PutMetricDataCommand(input));
    console.log("Metric published to CloudWatch");
  });

program.parse();
