# microk8s

- [microk8s.io](https://microk8s.io/)
  - [docs](https://microk8s.io/docs)
- [ubuntu/microk8s](https://github.com/ubuntu/microk8s)

1. [microk8s](#microk8s)
   1. [Setup 2 VMs](#setup-2-vms)
      1. [AWS EC2](#aws-ec2)
      1. [Vagrant](#vagrant)
         1. [(Option) Add a enterprise CA as a trusted certificate authority](#option-add-a-enterprise-ca-as-a-trusted-certificate-authority)
         1. [vagrant up](#vagrant-up)
   1. [Install microk8s](#install-microk8s)
      1. [All Nodes](#all-nodes)
         1. [Install MicroK8s](#install-microk8s-1)
         1. [Alias](#alias)
         1. [Join the group](#join-the-group)
         1. [Check the status](#check-the-status)
         1. [Access Kubernetes](#access-kubernetes)
      1. [Add Nodes](#add-nodes)
   1. [Deploy a service](#deploy-a-service)
   1. [Test](#test)
   1. [Clean up](#clean-up)

## Setup 2 VMs

- Ubuntu Server 20.04 LTS
- CPU: 1
- Memory: 4GB
- Private IP: `192.168.33.11` ~ `192.168.33.13`
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

Test:

```bash
# echo | openssl s_client -showcerts -servername snapcraft -connect api.snapcraft.io:443
openssl s_client -connect api.snapcraft.io:443 # -CApath /etc/ssl/certs
```

#### vagrant up

- Vagrant: [Download](https://www.vagrantup.com/downloads)
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

#### Alias

```bash
echo "alias kubectl='microk8s kubectl'" >> ~/.bash_aliases
```

#### Join the group

```bash
sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube
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

### Add Nodes

---

## Deploy a service

---

## Test

---

## Clean up

```bash
vagrant halt # [node1, node2 ...]
vagrant destroy -f
```
