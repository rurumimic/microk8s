# microk8s

- [microk8s.io](https://microk8s.io/)
  - [docs](https://microk8s.io/docs)
- [ubuntu/microk8s](https://github.com/ubuntu/microk8s)

1. [microk8s](#microk8s)
   1. [Setup VM](#setup-vm)
      1. [AWS EC2](#aws-ec2)
      1. [Vagrant](#vagrant)
         1. [(Option) Add a enterprise CA as a trusted certificate authority](#option-add-a-enterprise-ca-as-a-trusted-certificate-authority)
         1. [Start Vagrant](#start-vagrant)
   1. [Install microk8s](#install-microk8s)
      1. [All Nodes](#all-nodes)
         1. [Install MicroK8s](#install-microk8s-1)
         1. [Post-installation steps](#post-installation-steps)
         1. [Check the status](#check-the-status)
         1. [Access Kubernetes](#access-kubernetes)
      1. [Enable addons](#enable-addons)
         1. [Istio sidecar injection](#istio-sidecar-injection)
         1. [List of the most important addons](#list-of-the-most-important-addons)
      1. [Image registry](#image-registry)
         1. [Push to local registroy](#push-to-local-registroy)
         1. [Test](#test)
   1. [Deploy a service](#deploy-a-service)
      1. [Build & push a docker image](#build--push-a-docker-image)
      1. [Apply a service](#apply-a-service)
   1. [Test](#test-1)
      1. [Delete a service](#delete-a-service)
   1. [Clean up VM](#clean-up-vm)
   1. [Add Nodes](#add-nodes)
      1. [Chcek the status](#chcek-the-status)
      1. [Remove nodes](#remove-nodes)

## Setup VM

- Ubuntu Server 20.04 LTS
- CPU: 1
- Memory: 4GB
- Open Port: `8080` → `80`

### AWS EC2

[Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types)

| type | vCPU | Memory GiB |
|---|---|---|
| t2.micro | 1 | 1 |
| t2.medium | 2 | 4 |

### Vagrant

#### (Option) Add a enterprise CA as a trusted certificate authority

Add `*.cer`, `*.crt`, `*.pem` to `.gitignore`.  

`.cer` to `.crt`:
- `openssl x509 -inform DER -in before.cer -noout text`
- `openssl x509 -inform DER -in before.cer -out after.crt`

And copy certificates to `ca-trust` directory:

```bash
cp /path/to/enterprise.crt ./ca-trust
```

#### Start Vagrant

- Vagrant: [Download](https://www.vagrantup.com/downloads)
- VirtualBox: [Download](https://www.virtualbox.org/wiki/Downloads)
- [Vagrantfile](Vagrantfile)

```bash
vagrant box add ubuntu/focal64 # --insecure
vagrant up
```

## Install microk8s

### All Nodes

```bash
vagrant ssh node1 # [node2 ...]
```

#### Install MicroK8s

```bash
sudo snap install microk8s --classic
```

#### Post-installation steps

```bash
sudo usermod -a -G microk8s $USER # Join the group
sudo chown -f -R $USER ~/.kube
echo "alias kubectl='microk8s kubectl'" >> ~/.bash_aliases # Alias
echo 'source <(kubectl completion bash)' >>~/.bashrc # Command-line auto completion
exit
```

Reconnect:

```bash
vagrant ssh node1 # [node2 ...]
```

#### Check the status

```bash
microk8s status --wait-ready
```

#### Access Kubernetes

```bash
kubectl get nodes
kubectl get services
```

### Enable addons

on `node1`:

```bash
microk8s enable dns storage registry istio
```

#### Istio sidecar injection

Istio: [Installing the Sidecar](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/)

```bash
kubectl label namespace default istio-injection=enabled
```

#### List of the most important addons

Ubuntu tutorials: [Enable addons](https://ubuntu.com/tutorials/install-a-local-kubernetes-with-microk8s#3-enable-addons)

- **dns**: Deploy DNS. This addon may be required by others, thus we recommend you always enable it.
- dashboard: Deploy kubernetes dashboard.
- **storage**: Create a default storage class. This storage class makes use of the hostpath-provisioner pointing to a directory on the host.
- **ingress**: Create an ingress controller.
- gpu: Expose GPU(s) to MicroK8s by enabling the nvidia-docker runtime and nvidia-device-plugin-daemonset. Requires NVIDIA drivers to be already installed on the host system.
- [istio](https://istio.io/latest/docs/setup/platform-setup/microk8s/): Deploy the core Istio services. You can use the microk8s istioctl command to manage your deployments.
- **registry**: Deploy a docker private registry and expose it on localhost:32000. The storage addon will be enabled as part of this addon.

### Image registry

#### Push to local registroy

```bash
docker pull nginx:alpine
docker tag nginx:alpine localhost:32000/nginx:alpine
docker push localhost:32000/nginx:alpine
```

#### Test

```bash
kubectl apply -f /k8s/nginx/deployment.yaml
```

On the host machine: [http://192.168.33.11:30080](http://192.168.33.11:30080)

```bash
kubectl delete -f /k8s/nginx/deployment.yaml
```

---

## Deploy a service

### Build & push a docker image

```bash
docker build -t localhost:32000/app:latest /k8s/app
docker push localhost:32000/app:latest
```

### Apply a service

```bash
kubectl apply -f /k8s/nginx/configmap.yaml -f /k8s/deployment.yaml
```

---

## Test

On the host machine: [http://192.168.33.11:30080](http://192.168.33.11:30080)

### Delete a service

```bash
kubectl delete -f /k8s/nginx/configmap.yaml -f /k8s/deployment.yaml
```

---

## Clean up VM

```bash
vagrant halt # [node1, node2 ...]
vagrant destroy -f # [node1, node2 ...]
```

## Add Nodes

on `node1`:

```bash
microk8s add-node
```

Copy and paste token on the `node2`:

```bash
microk8s join 172.30.1.44:25000/a28382c08b010750059d6c43e7a00bb4
```

Check on `node1`:

```bash
kubectl get nodes

NAME    STATUS   ROLES    AGE     VERSION
node1   Ready    <none>   10m     v1.19.3-34+a56971609ff35a
node2   Ready    <none>   20s     v1.19.3-34+a56971609ff35a
```

Repeat this process for `node3`.

```bash
NAME    STATUS   ROLES    AGE     VERSION
node1   Ready    <none>   15m     v1.19.3-34+a56971609ff35a
node2   Ready    <none>    5m     v1.19.3-34+a56971609ff35a
node3   Ready    <none>   10s     v1.19.3-34+a56971609ff35a
```

### Chcek the status

```bash
microk8s status

microk8s is running
high-availability: yes
  datastore master nodes: 192.168.33.11:19001 192.168.33.12:19001 192.168.33.13:19001
  datastore standby nodes: none
```

### Remove nodes

on `node3`:

```bash
microk8s leave # node will be marked as ‘NotReady’ (unreachable)
microk8s stop
```

on `node1`:

```bash
microk8s remove-node node3 # [node2 ...]
```
