# How to deploy production application using `systemd`

## Dependencies on developer machine (optional):

- Git
- Docker

## Dependencies on target machine:

- Docker


## Steps to build (optional)

1. Clone the repository:

    ```bash
    GIT_REF="main"
    git clone "https://github.com/edgedb/edgedb-studio.git" --single-branch --branch $GIT_REF
    ```

2. Build the docker image:

    ```bash
    docker build --tag edgedb-studio -f docker/Dockerfile .
    ```

3. Optional: Tag and push the image:

    ```bash
    docker tag edgedb-studio my.registry/custom-name:custom-ag
    docker push my.registry/custom-name:custom-ag
    ```

## Steps to deploy

### Running an EdgeDB Instance

In order to deploy EdgeDB Studio, it's necessary to have a running EdgeDB Instance.

If you already have an EdgeDB instance running, you can skip this part.

#### Local EdgeDB Instance

To quickly set up a server, `edgedb` CLI can be used. This instance will listen to the local interface only by default (`127.0.0.1`).

When running EdgeDB Studio in a container within WSL2, due to corporate softwares being installed, the `--network=host` option with the `docker run` command might not b e effective. As such, local interface within EdgeDB Studio container is different from host local interface, thus EdgeDB Server must accept incoming connections from an additional interface.

> In this example, EdgeDB Server ican be reached on `172.21.59.119` (the ip address of my `eht0` interface on WSL2). Both WSL2 and Windows can resolve this address:

- Create an instance:

    ```bash
    edgedb instance create --port 10700 --nightly sandbox --start-conf manual
    ```

- Configure the instance to listen to all interfaces:

    ```bash
    edgedb configure -I sandbox set listen_addresses "*"
    edgedb instance restart sandbox
    ```

#### Running EdgeDB Studio

1. On the machine where you want to deploy EdgeDB Studio run:

    ```bash
    # The address on which EdgeDB can be reached from within the webserver container
    export EDGEDB_HOST="172.21.59.119"
    # The port published on host network
    export STUDIO_PORT="10780"
    # Start the container
    docker run -it --rm -p "$STUDIO_PORT:80" --env EDGEDB_HOST="$EDGEDB_HOST" edgedb-studio
    ```

    You can now visit `http://localhost:$STUDIO_PORT` (<http://localhost:10780>) by default

### Running EdgeDB Studio and EdgeDB using docker-compose

You can use the following `docker-compose.yml` to quickly setup a test instance:

```yaml
version: "3"
services:
  edgedb:
    image: edgedb/edgedb:nightly
    environment:
      EDGEDB_SERVER_SECURITY: insecure_dev_mode
    volumes:
      - "./dbschema:/dbschema"
    ports:
      - "10700:5656"
  studio:
    image: edgedb-studio
    environment:
      EDGEDB_HOST: edgedb
      EDGEDB_PORT: 5656
    ports:
      - "10780:80"
```

Run `docker compose -f docker/docker-compose.yml up` to start the applications.

I don't know why but when sending an HTTP request on `http://localhost:10700/ui/instance-info`, a `404` response is returned 😓.
