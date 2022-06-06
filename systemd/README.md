# How to deploy production application using `systemd`

## Dependencies on developer machine:

- Git
- NodeJS
- Yarn

## Dependencies on target machine:

- Caddy

## Steps to build

1. Clone the repository:

    ```bash
    git clone https://github.com/edgedb/edgedb-studio.git
    ```

2. Install the project dependencies using `yarn`:

    ```bash
    cd edgedb-studio
    yarn
    ```

3. Build the `web` project using `yarn`:

    ```bash
    cd web/
    yarn build
    ```

## Steps to deploy

1. Install `caddy` by copying the binary file into the `/opt/edgedb-studio` directory:

    ```bash
    # Create a new directory
    sudo mkdir -p /opt/edgedb-studio
    # Download file
    sudo wget "https://caddyserver.com/api/download?os=linux&arch=amd64&idempotency=69254609724659" -O "/opt/edgedb-studio/caddy"
    # Make executable
    sudo chmod +x /opt/edgedb-studio/caddy
    ```

2. Create a `edgedb-studio` group and user:

    ```bash
    # First create group
    sudo groupadd --system edgedb-studio
    # Then create user
    sudo useradd --system \
        --gid edgedb-studio \
        --create-home \
        --home-dir /var/lib/edgedb-studio \
        --shell /usr/sbin/nologin \
        --comment "Caddy server for EdgeDB Studio web application" \
        edgedb-studio
    ```

3. Create directories from where web content will be served

    ```bash
    # Create a directory where builds will be stored
    sudo mkdir -p /opt/edgedb-studio/builds
    ```

4. Copy build

    ```bash
    export BUILD_TIMESTAMP=$(date "+%s")
    # Copy build directory using unix timestamp as name
    sudo -E cp -R ./build "/opt/edgedb-studio/builds/$BUILD_TIMESTAMP"
    ```

5. Configure default build to use

    ```bash
    # Create symlink to directory with constant name
    sudo -E ln -sfn "/opt/edgedb-studio/builds/$BUILD_TIMESTAMP/" /var/lib/edgedb-studio/www
    ```

    At this point, web directory (`/var/lib/edgedb-studio/www`) points to the directory `/opt/edgedb-studio/builds/$BUILD_TIMESTAMP`.
    
    >It's possible to change the directory where the symlink points to using the following command:
    > `ln -sfn <new_path> /var/lib/edgedb-studio/www`
    > This way application updates can be delivered without removing files and it's easy to rollback.

6. Prepare caddyfile. Copy the following lines into `/etc/edgedb-studio/Caddyfile`:

    Run the command:
        
    ```bash
    sudo mkdir -p /etc/edgedb-studio
    ```

    Then create the file:

    ```
    # 💡 Use a domain name instead of a port to benefit from Caddy automatic TLS features
    # 💡 You can also change the port if you wish to use HTTP without TLS
    :10780 {
            root * /var/lib/edgedb-studio/www
            handle_path /ui/* {
                    file_server {
                            pass_thru
                    }
            }
            handle /ui/* {
                    rewrite * /ui{uri}
                    # 📢 This is the URL of the EdgeDB Server 📢
                    # It must be updated if server is not listenning on localhost on port 10700
                    reverse_proxy * localhost:10700
            }
            file_server {
                    index index.html
            }
            encode gzip
    }
    ```

    > Don't forget to editate the file if needed !


7. Create a `systemd` unit for `caddy` server into the file `/etc/systemd/system/edgedb-studio.service`:

    ```ini
    # edgedb-studio.service
    #
    # For using Caddy with a config file.
    #
    # Make sure the ExecStart and ExecReload commands are correct
    # for your installation.
    #
    # See https://caddyserver.com/docs/install for instructions.
    #
    # WARNING: This service does not use the --resume flag, so if you
    # use the API to make changes, they will be overwritten by the
    # Caddyfile next time the service is restarted. If you intend to
    # use Caddy's API to configure it, add the --resume flag to the
    # `caddy run` command or use the caddy-api.service file instead.

    [Unit]
    Description=Caddy Server for EdgeDB Studio web application
    Documentation=https://caddyserver.com/docs/
    After=network.target network-online.target
    Requires=network-online.target

    [Service]
    Type=notify
    User=edgedb-studio
    Group=edgedb-studio
    ExecStart=/opt/edgedb-studio/caddy run --environ --config /etc/edgedb-studio/Caddyfile
    ExecReload=/opt/edgedb-studio/caddy reload --config /etc/edgedb-studio/Caddyfile
    TimeoutStopSec=5s
    LimitNOFILE=1048576
    LimitNPROC=512
    PrivateTmp=true
    ProtectSystem=full
    AmbientCapabilities=CAP_NET_BIND_SERVICE

    [Install]
    WantedBy=multi-user.target
    ```

8. Double-check the ExecStart and ExecReload directives.

    Make sure the binary's location and command line arguments are correct for your installation!
    For example: change your `--config` path if it is different from the defaults.

9.  Reload è systemctl` and enable the service:

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable --now edgedb-studio
    ```

10. Visit <http://localhost:10780> or the domain you configured.
