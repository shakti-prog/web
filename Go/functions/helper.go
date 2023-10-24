package functions

import "time"



func getNumberOfDays(givenTime time.Time) int { 
	currentTime := time.Now();
	differenceInDays := int(currentTime.Sub(givenTime).Hours()/24);
	return differenceInDays;
}