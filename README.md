# deployment-stats

Records statsd metrics about deployments to CloudWatch.

## Installation

```sh
npm install @cuckoointernet/deployment-stats
```

## Usage

```sh
npx deployment-stats deployment website --status failure --environment stage --deploy-duration 60
```

See `npx deployment-stats --help` for more commands.
