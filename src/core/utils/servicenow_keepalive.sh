#!/bin/bash
set -e

SN_INSTANCE="https://dev275557.service-now.com"
SN_USER="${SERVICENOW_USER}"
SN_PASS="${SERVICENOW_PASS}"

echo "Sending keep-alive ping to ServiceNow..."

# Lightweight API ping
response=$(curl -s -u "$SN_USER:$SN_PASS" \
  -H "Accept: application/json" \
  "$SN_INSTANCE/api/now/table/sys_user?sysparm_limit=1")

# Optional: verify response
if echo "$response" | grep -q "result"; then
  echo "ServiceNow instance responded successfully."
else
  echo "Warning: Instance did not respond as expected."
fi
