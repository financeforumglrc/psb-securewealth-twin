"""
SecureWealth Twin — Knowledge Graph Risk Engine
Detects shared-device / mule-ring patterns using an in-memory NetworkX graph.
For demo purposes the graph is seeded with a small fraud ring.
"""

import hashlib
import networkx as nx
from typing import Optional


class FraudGraph:
    def __init__(self):
        self.G = nx.Graph()
        self._seed_demo_data()

    def _seed_demo_data(self):
        # Known fraud ring: fraudster_1 controls multiple mule accounts from the same device
        fraudster = "fraudster_1"
        device = "device_fraud_abc123"
        mules = ["mule_ramesh", "mule_suresh", "mule_vikram"]

        self.G.add_node(fraudster, kind="user")
        self.G.add_node(device, kind="device")
        self.G.add_edge(fraudster, device, relation="uses")

        for mule in mules:
            self.G.add_node(mule, kind="user")
            self.G.add_edge(mule, device, relation="uses")
            self.G.add_edge(fraudster, mule, relation="recruits")

    def _fingerprint(self, value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()[:16]

    def analyze(self, user_id: str, payee: str, device_fingerprint: Optional[str] = None) -> dict:
        # Normalize inputs to stable IDs
        user_node = f"user_{self._fingerprint(user_id)}"
        payee_node = f"payee_{self._fingerprint(payee)}"
        device_node = f"device_{self._fingerprint(device_fingerprint or '')}" if device_fingerprint else None

        self.G.add_node(user_node, kind="user")
        self.G.add_node(payee_node, kind="payee")
        self.G.add_edge(user_node, payee_node, relation="pays")

        if device_node:
            self.G.add_node(device_node, kind="device")
            self.G.add_edge(user_node, device_node, relation="uses")

        linked_to_fraud_device = False
        ring_size = 0
        reason = "No graph risk detected."

        if device_node and nx.has_path(self.G, device_node, "device_fraud_abc123"):
            linked_to_fraud_device = True
            ring_nodes = list(nx.node_connected_component(self.G, device_node))
            ring_size = len(ring_nodes)
            reason = f"This device or payee shares a connection with a known fraud ring of {ring_size} nodes."

        elif nx.has_path(self.G, payee_node, "fraudster_1"):
            linked_to_fraud_device = True
            ring_nodes = list(nx.node_connected_component(self.G, payee_node))
            ring_size = len(ring_nodes)
            reason = f"Payee is linked to a known fraudster through a network of {ring_size} nodes."

        risk_bonus = 25 if linked_to_fraud_device else 0

        return {
            "linked_to_fraud_device": linked_to_fraud_device,
            "ring_size": ring_size,
            "risk_bonus": risk_bonus,
            "reason": reason,
        }


fraud_graph = FraudGraph()
