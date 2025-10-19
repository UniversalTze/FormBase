// components/SummaryCard.jsx
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export default function SummaryCard({ title, description }) {
  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text variant="bodyMedium" style={styles.desc} numberOfLines={4}>
            {description}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 0}, // how shared the edges are
  content: { paddingVertical: 12 },
  title: { fontWeight: "700", textAlign:"center", fontSize: 18},
  desc: { marginTop: 6, opacity: 0.8,},
});