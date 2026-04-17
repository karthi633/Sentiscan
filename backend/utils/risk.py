def calculate_risk(num_sensitive_items):
    """
    Determines Risk Level based on how much PII was found.
    Rule:
      0 items -> LOW (Safe)
      1-2 items -> MEDIUM (Caution)
      3+ items -> HIGH (Critical)
    """
    if num_sensitive_items == 0:
        return "LOW"
    elif num_sensitive_items < 3:
        return "MEDIUM"
    else:
        return "HIGH"