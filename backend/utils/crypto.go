package utils

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "io"
    "os"
)

func Encrypt(text string) (string, error) {
    key := []byte(os.Getenv("ENCRYPTION_KEY"))
    plaintext := []byte(text)
    block, err := aes.NewCipher(key)
    if err != nil {
        return "", err
    }
    ciphertext := make([]byte, aes.BlockSize+len(plaintext))
    iv := ciphertext[:aes.BlockSize]
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return "", err
    }
    stream := cipher.NewCFBEncrypter(block, iv)
    stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)
    return base64.URLEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(cryptoText string) (string, error) {
    key := []byte(os.Getenv("ENCRYPTION_KEY"))
    ciphertext, _ := base64.URLEncoding.DecodeString(cryptoText)
    block, err := aes.NewCipher(key)
    if err != nil {
        return "", err
    }
    iv := ciphertext[:aes.BlockSize]
    ciphertext = ciphertext[aes.BlockSize:]
    stream := cipher.NewCFBDecrypter(block, iv)
    stream.XORKeyStream(ciphertext, ciphertext)
    return string(ciphertext), nil
}
