package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("🚀 Starting SIEM Stress Test...")

	authLog, err := os.OpenFile("auth.log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("❌ Failed to open auth.log:", err)
		return
	}
	defer authLog.Close()

	accessLog, err := os.OpenFile("access.log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("❌ Failed to open access.log:", err)
		return
	}
	defer accessLog.Close()

	// Generate 10,000 logs (5,000 of each)
	count := 5000
	for i := 0; i < count; i++ {
		authLine := fmt.Sprintf("May 16 12:00:00 server sshd[1234]: Failed password for invalid user stress_tester_%d from 192.168.1.150 port 22 ssh2\n", i)
		authLog.WriteString(authLine)

		accessLine := fmt.Sprintf("10.0.0.55 - - [16/May/2026:12:00:00 +0000] \"GET /admin?stress_test=%d HTTP/1.1\" 404 153 \"-\" \"stress_tester\"\n", i)
		accessLog.WriteString(accessLine)
	}

	fmt.Printf("✅ %d Logs Generated (%d Auth, %d Nginx).\n", count*2, count, count)
	fmt.Println("🔥 Watch your log-agent queue, Kafka UI throughput, and SIEM backend consume the burst!")
}
