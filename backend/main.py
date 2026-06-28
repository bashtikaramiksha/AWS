from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, or_
from sqlalchemy.orm import Session, relationship
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
import datetime
import auth
from database import engine, Base, SessionLocal

# DB Models
class HostedZone(Base):
    __tablename__ = "hosted_zones"
    id = Column(Integer, primary_key=True, index=True)
    domain_name = Column(String, nullable=False)
    zone_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    record_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Cascade delete records when zone is deleted
    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

class DNSRecord(Base):
    __tablename__ = "dns_records"
    id = Column(Integer, primary_key=True, index=True)
    hosted_zone_id = Column(Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    record_name = Column(String, nullable=False)
    record_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    ttl = Column(Integer, nullable=False)
    routing_policy = Column(String, default="Simple")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    hosted_zone = relationship("HostedZone", back_populates="records")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Route53 Clone API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class HostedZoneBase(BaseModel):
    domain_name: str = Field(..., min_length=1)
    zone_type: Literal["public", "private"]
    description: Optional[str] = None

class HostedZoneCreate(HostedZoneBase):
    pass

class HostedZoneUpdate(BaseModel):
    domain_name: Optional[str] = Field(None, min_length=1)
    zone_type: Optional[Literal["public", "private"]] = None
    description: Optional[str] = None

class HostedZoneResponse(HostedZoneBase):
    id: int
    record_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# DNS Record Pydantic Schemas
RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]

class DNSRecordBase(BaseModel):
    record_name: str = Field(..., min_length=1)
    record_type: RecordType
    value: str = Field(..., min_length=1)
    ttl: int = Field(..., gt=0)
    routing_policy: Optional[str] = "Simple"

class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecordUpdate(BaseModel):
    record_name: Optional[str] = Field(None, min_length=1)
    record_type: Optional[RecordType] = None
    value: Optional[str] = Field(None, min_length=1)
    ttl: Optional[int] = Field(None, gt=0)
    routing_policy: Optional[str] = None

class DNSRecordResponse(DNSRecordBase):
    id: int
    hosted_zone_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Routes
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Hosted Zone Routes
@app.post("/hosted-zones", response_model=HostedZoneResponse)
def create_hosted_zone(zone: HostedZoneCreate, db: Session = Depends(get_db)):
    db_zone = HostedZone(
        domain_name=zone.domain_name,
        zone_type=zone.zone_type,
        description=zone.description,
        record_count=2 # Initial SOA & NS records
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)

    # Create default NS & SOA records
    ns_record = DNSRecord(
        hosted_zone_id=db_zone.id,
        record_name=db_zone.domain_name,
        record_type="NS",
        value="ns-1.awsdns.com.",
        ttl=172800,
        routing_policy="Simple"
    )
    soa_record = DNSRecord(
        hosted_zone_id=db_zone.id,
        record_name=db_zone.domain_name,
        record_type="SOA",
        value=f"ns-1.awsdns.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
        ttl=900,
        routing_policy="Simple"
    )
    db.add_all([ns_record, soa_record])
    db.commit()
    db.refresh(db_zone)
    return db_zone

@app.get("/hosted-zones", response_model=List[HostedZoneResponse])
def list_hosted_zones(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(HostedZone)
    if search:
        query = query.filter(HostedZone.domain_name.contains(search))
    
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@app.get("/hosted-zones/{id}", response_model=HostedZoneResponse)
def get_hosted_zone(id: int, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return db_zone

@app.put("/hosted-zones/{id}", response_model=HostedZoneResponse)
def update_hosted_zone(id: int, zone: HostedZoneUpdate, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    if zone.domain_name is not None:
        db_zone.domain_name = zone.domain_name
    if zone.zone_type is not None:
        db_zone.zone_type = zone.zone_type
    if zone.description is not None:
        db_zone.description = zone.description
        
    db_zone.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_zone)
    return db_zone

@app.delete("/hosted-zones/{id}")
def delete_hosted_zone(id: int, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    db.delete(db_zone)
    db.commit()
    return {"message": "Hosted zone deleted successfully"}

# DNS Record Routes
@app.post("/hosted-zones/{zone_id}/records", response_model=DNSRecordResponse)
def create_dns_record(zone_id: int, record: DNSRecordCreate, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    db_record = DNSRecord(
        hosted_zone_id=zone_id,
        record_name=record.record_name,
        record_type=record.record_type,
        value=record.value,
        ttl=record.ttl,
        routing_policy=record.routing_policy
    )
    db.add(db_record)
    
    # Update zone record count
    db_zone.record_count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).count() + 1
    
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/hosted-zones/{zone_id}/records", response_model=List[DNSRecordResponse])
def list_dns_records(
    zone_id: int,
    search: Optional[str] = None,
    type: Optional[RecordType] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
        
    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id)
    if search:
        query = query.filter(
            or_(
                DNSRecord.record_name.contains(search),
                DNSRecord.value.contains(search)
            )
        )
    if type:
        query = query.filter(DNSRecord.record_type == type)
        
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@app.get("/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def get_dns_record(zone_id: int, record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id == record_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="DNS Record not found")
    return db_record

@app.put("/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def update_dns_record(zone_id: int, record_id: int, record: DNSRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id == record_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="DNS Record not found")
        
    if record.record_name is not None:
        db_record.record_name = record.record_name
    if record.record_type is not None:
        db_record.record_type = record.record_type
    if record.value is not None:
        db_record.value = record.value
    if record.ttl is not None:
        db_record.ttl = record.ttl
    if record.routing_policy is not None:
        db_record.routing_policy = record.routing_policy
        
    db_record.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_record)
    return db_record

@app.delete("/hosted-zones/{zone_id}/records/{record_id}")
def delete_dns_record(zone_id: int, record_id: int, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
        
    db_record = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id == record_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="DNS Record not found")
        
    db.delete(db_record)
    
    # Update zone record count
    db_zone.record_count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).count() - 1
    
    db.commit()
    return {"message": "DNS Record deleted successfully"}

# Export and Bulk Operations
class BulkDeleteRequest(BaseModel):
    record_ids: List[int]

@app.post("/hosted-zones/{zone_id}/records/bulk-delete")
def bulk_delete_dns_records(zone_id: int, request: BulkDeleteRequest, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
        
    db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id.in_(request.record_ids)
    ).delete(synchronize_session=False)
    
    # Update zone record count
    db_zone.record_count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).count()
    db.commit()
    return {"message": f"Successfully deleted {len(request.record_ids)} records"}

@app.get("/hosted-zones/{zone_id}/export/json")
def export_hosted_zone_json(zone_id: int, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).all()
    
    return {
        "hosted_zone": {
            "id": db_zone.id,
            "domain_name": db_zone.domain_name,
            "zone_type": db_zone.zone_type,
            "description": db_zone.description,
            "created_at": db_zone.created_at.isoformat(),
            "updated_at": db_zone.updated_at.isoformat(),
        },
        "records": [
            {
                "id": r.id,
                "record_name": r.record_name,
                "record_type": r.record_type,
                "value": r.value,
                "ttl": r.ttl,
                "routing_policy": r.routing_policy
            } for r in records
        ]
    }

@app.get("/hosted-zones/{zone_id}/export/bind")
def export_hosted_zone_bind(zone_id: int, db: Session = Depends(get_db)):
    db_zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).all()
    
    lines = [
        f"; Zone file for {db_zone.domain_name} (ID: {db_zone.id})",
        f"; Exported at {datetime.datetime.utcnow().isoformat()}",
        f"$TTL 300",
        ""
    ]
    for r in records:
        name = r.record_name
        if name == db_zone.domain_name:
            name = "@"
        else:
            if name.endswith("." + db_zone.domain_name):
                name = name[:-len("." + db_zone.domain_name)]
        lines.append(f"{name:<15} IN  {r.record_type:<6} {r.value}")
        
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("\n".join(lines))
