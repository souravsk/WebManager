package utils

import (
    "golang.org/x/crypto/ssh"
    "fmt"
    "time"
)

func RunSSHCommand(user, addr string, port int, privKey string, cmd string) (string, error) {
    signer, err := ssh.ParsePrivateKey([]byte(privKey))
    if err != nil {
        return "", err
    }
    config := &ssh.ClientConfig{
        User: user,
        Auth: []ssh.AuthMethod{ssh.PublicKeys(signer)},
        HostKeyCallback: ssh.InsecureIgnoreHostKey(),
        Timeout: 10 * time.Second,
    }
    client, err := ssh.Dial("tcp", fmt.Sprintf("%s:%d", addr, port), config)
    if err != nil {
        return "", err
    }
    defer client.Close()

    session, err := client.NewSession()
    if err != nil {
        return "", err
    }
    defer session.Close()

    out, err := session.CombinedOutput(cmd)
    return string(out), err
}
