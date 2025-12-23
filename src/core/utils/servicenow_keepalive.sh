#!/bin/bash
set -e

SN_INSTANCE="https://dev275557.service-now.com"
SN_USER="${SERVICENOW_USER}"
SN_PASS="${SERVICENOW_PASS}"

echo "Refreshing ServiceNow instance..."

# Wake up hibernated instance via login page
curl -s -L -u "$SN_USER:$SN_PASS" \
  -c /tmp/sn_cookies -b /tmp/sn_cookies \
  "$SN_INSTANCE/login.do" > /dev/null

# Verify instance is responding
response=$(curl -s -u "$SN_USER:$SN_PASS" \
  -H "Accept: application/json" \
  "$SN_INSTANCE/api/now/table/sys_user?sysparm_limit=1")

if echo "$response" | grep -q "result"; then
  echo "ServiceNow instance refreshed and responding."
else
  echo "Warning: Instance may still be waking up."
fi
