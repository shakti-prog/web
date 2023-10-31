package functions

import (
	"strings"
	"time"
)

func getNumberOfDays(givenTime time.Time) int {
	currentTime := time.Now()
	differenceInDays := int(currentTime.Sub(givenTime).Hours() / 24)
	return differenceInDays
}

func reverseArray(arr []string) []string {
	i := 0
	j := len(arr) - 1

	for i <= j {
		temp := arr[i]
		arr[i] = arr[j]
		arr[j] = temp
		i++
		j--
	}
	return arr
}

func createWordMap(text string, word map[string]string) map[string]string {
	words := strings.Fields(text)
	for _, text := range words {
		for n := 3; n <= len(text); n++ {
			for i := 0; i <= len(text)-n; i++ {
				ngram := text[i : i+n]
				word[ngram] = ngram
			}
		}

	}
	return word
}
