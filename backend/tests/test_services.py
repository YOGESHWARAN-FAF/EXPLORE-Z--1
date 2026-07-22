import unittest
from app.models.member import MemberCreate
from app.models.tracking import MemberLocation
from app.services.health_rules import evaluate_group_health
from app.services.geofence_service import haversine_distance_meters, evaluate_group_tracking

class TestServices(unittest.TestCase):
    def test_haversine_distance(self):
        d = haversine_distance_meters(11.4102, 76.6950, 11.4180, 76.7020)
        self.assertTrue(1000 <= d <= 1500)

    def test_missing_member_detection(self):
        members = [
            MemberLocation(member_id="m1", member_name="Leader", latitude=11.4102, longitude=76.6950),
            MemberLocation(member_id="m2", member_name="Member Near", latitude=11.4103, longitude=76.6951),
            MemberLocation(member_id="m3", member_name="Stray Member", latitude=11.4150, longitude=76.7000) # ~ 750m away
        ]
        res = evaluate_group_tracking(members, geofence_radius_km=5.0)
        self.assertEqual(res["missing_count"], 1)
        self.assertEqual(res["missing_members"][0]["member_name"], "Stray Member")

    def test_health_rules_senior_heart(self):
        m = MemberCreate(
            name="Robert",
            age=72,
            has_heart_disease=True,
            has_high_bp=True,
            walking_ability="Limited"
        )
        recs = evaluate_group_health([m])
        self.assertEqual(len(recs), 1)
        self.assertTrue(any("trekking" in act.lower() for act in recs[0].avoid_activities))
        self.assertTrue(any("botanical" in act.lower() for act in recs[0].recommended_activities))

if __name__ == "__main__":
    unittest.main()
