# ponytail: simple offline DB self-check
from main import HostedZone, DNSRecord, SessionLocal

def run_self_check():
    db = SessionLocal()
    try:
        # Create hosted zone
        zone = HostedZone(domain_name="test-records.com", zone_type="public", description="test zone", record_count=2)
        db.add(zone)
        db.commit()
        db.refresh(zone)
        
        # Create default mock records (similar to API logic)
        ns_record = DNSRecord(
            hosted_zone_id=zone.id,
            record_name=zone.domain_name,
            record_type="NS",
            value="ns-1.awsdns.com.",
            ttl=172800
        )
        db.add(ns_record)
        db.commit()
        
        # Check counts
        count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).count()
        assert count == 1
        
        # Clean up
        db.delete(ns_record)
        db.delete(zone)
        db.commit()
        
        print("DNS Records database self-check passed!")
    finally:
        db.close()

if __name__ == "__main__":
    run_self_check()
