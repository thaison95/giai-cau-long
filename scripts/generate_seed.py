# Script to generate SQL seed for Trusting Social tournament

tournament_id = 'c90dd0b1-a512-412b-ba3c-e7ae4d40db73'

teams_data = [
    {
        "num": 1,
        "name": "Đội 1",
        "short_name": "Đ1",
        "emoji": "1️⃣",
        "players": [
            ("Q.Long", "m"),
            ("Sang", "m"),
            ("Nhân", "m"),
            ("P.Long", "m"),
            ("Bảo", "m"),
            ("Thảo", "f"),
        ]
    },
    {
        "num": 2,
        "name": "Đội 2",
        "short_name": "Đ2",
        "emoji": "2️⃣",
        "players": [
            ("Giang", "m"),
            ("Tú", "m"),
            ("Luân", "m"),
            ("Thiên", "m"),
            ("Gương", "f"),
            ("Phúc", "f"),
        ]
    },
    {
        "num": 3,
        "name": "Đội 3",
        "short_name": "Đ3",
        "emoji": "3️⃣",
        "players": [
            ("Dũng", "m"),
            ("Minh", "m"),
            ("Huy", "m"),
            ("Khánh", "m"),
            ("Đức", "m"),
            ("Oanh", "f"),
        ]
    },
    {
        "num": 4,
        "name": "Đội 4",
        "short_name": "Đ4",
        "emoji": "4️⃣",
        "players": [
            ("Xuân", "m"),
            ("An", "m"),
            ("Sơn", "m"),
            ("Nhực", "m"),
            ("Tuấn", "m"),
            ("Nhi", "f"),
        ]
    },
    {
        "num": 5,
        "name": "Đội 5",
        "short_name": "Đ5",
        "emoji": "5️⃣",
        "players": [
            ("Quân", "m"),
            ("Hào", "m"),
            ("Tâm", "m"),
            ("Nhu Em", "m"),
            ("Hồng", "f"),
            ("Hạnh", "f"),
        ]
    },
    {
        "num": 6,
        "name": "Đội 6",
        "short_name": "Đ6",
        "emoji": "6️⃣",
        "players": [
            ("Cường", "m"),
            ("K.Đào", "m"),
            ("Triết", "m"),
            ("Bình", "m"),
            ("T.Huy", "m"),
            ("Mindy", "f"),
        ]
    },
]

# 15 ties definition: (teamA_num, teamB_num, [ (pos, [sideA_p1, sideA_p2], [sideB_p1, sideB_p2]) ])
matchups = [
    # Đội 1 vs Đội 2
    (1, 2, [
        (1, ["Q.Long", "Sang"], ["Giang", "Tú"]),
        (2, ["Nhân", "P.Long"], ["Luân", "Thiên"]),
        (3, ["Bảo", "Thảo"], ["Giang", "Gương"]),
    ]),
    # Đội 1 vs Đội 3
    (1, 3, [
        (1, ["Bảo", "Q.Long"], ["Dũng", "Minh"]),
        (2, ["Nhân", "P.Long"], ["Huy", "Khánh"]),
        (3, ["Sang", "Thảo"], ["Đức", "Oanh"]),
    ]),
    # Đội 1 vs Đội 4
    (1, 4, [
        (1, ["Nhân", "Bảo"], ["Xuân", "An"]),
        (2, ["Q.Long", "Sang"], ["Sơn", "Nhực"]),
        (3, ["P.Long", "Thảo"], ["Tuấn", "Nhi"]),
    ]),
    # Đội 1 vs Đội 5
    (1, 5, [
        (1, ["Q.Long", "Sang"], ["Quân", "Hào"]),
        (2, ["Nhân", "P.Long"], ["Tâm", "Nhu Em"]),
        (3, ["Bảo", "Thảo"], ["Quân", "Hồng"]),
    ]),
    # Đội 1 vs Đội 6
    (1, 6, [
        (1, ["Bảo", "Q.Long"], ["Cường", "K.Đào"]),
        (2, ["Nhân", "P.Long"], ["Triết", "Bình"]),
        (3, ["Sang", "Thảo"], ["T.Huy", "Mindy"]),
    ]),

    # Đội 2 vs Đội 3
    (2, 3, [
        (1, ["Giang", "Luân"], ["Dũng", "Minh"]),
        (2, ["Tú", "Thiên"], ["Huy", "Khánh"]),
        (3, ["Giang", "Phúc"], ["Đức", "Oanh"]),
    ]),
    # Đội 2 vs Đội 4
    (2, 4, [
        (1, ["Giang", "Thiên"], ["Xuân", "Sơn"]),
        (2, ["Tú", "Luân"], ["Nhực", "Tuấn"]),
        (3, ["Tú", "Phúc"], ["An", "Nhi"]),
    ]),
    # Đội 2 vs Đội 5
    (2, 5, [
        (1, ["Giang", "Thiên"], ["Quân", "Tâm"]),
        (2, ["Tú", "Luân"], ["Hào", "Nhu Em"]),
        (3, ["Giang", "Phúc"], ["Tâm", "Hạnh"]),
    ]),
    # Đội 2 vs Đội 6
    (2, 6, [
        (1, ["Giang", "Tú"], ["Cường", "T.Huy"]),
        (2, ["Luân", "Thiên"], ["K.Đào", "Bình"]),
        (3, ["Luân", "Gương"], ["Triết", "Mindy"]),
    ]),

    # Đội 3 vs Đội 4
    (3, 4, [
        (1, ["Dũng", "Minh"], ["Xuân", "An"]),
        (2, ["Huy", "Khánh"], ["Sơn", "Nhực"]),
        (3, ["Đức", "Oanh"], ["Tuấn", "Nhi"]),
    ]),
    # Đội 3 vs Đội 5
    (3, 5, [
        (1, ["Dũng", "Minh"], ["Tâm", "Hào"]),
        (2, ["Huy", "Khánh"], ["Quân", "Nhu Em"]),
        (3, ["Đức", "Oanh"], ["Hào", "Hồng"]),
    ]),
    # Đội 3 vs Đội 6
    (3, 6, [
        (1, ["Dũng", "Minh"], ["Triết", "K.Đào"]),
        (2, ["Huy", "Khánh"], ["T.Huy", "Bình"]),
        (3, ["Đức", "Oanh"], ["Cường", "Mindy"]),
    ]),

    # Đội 4 vs Đội 5
    (4, 5, [
        (1, ["Xuân", "Tuấn"], ["Quân", "Hào"]),
        (2, ["Nhực", "An"], ["Tâm", "Nhu Em"]),
        (3, ["Sơn", "Nhi"], ["Quân", "Hạnh"]),
    ]),
    # Đội 4 vs Đội 6
    (4, 6, [
        (1, ["Xuân", "An"], ["Cường", "Triết"]),
        (2, ["Sơn", "Nhực"], ["K.Đào", "Bình"]),
        (3, ["Tuấn", "Nhi"], ["T.Huy", "Mindy"]),
    ]),

    # Đội 5 vs Đội 6
    (5, 6, [
        (1, ["Tâm", "Quân"], ["Cường", "Triết"]),
        (2, ["Hào", "Nhu Em"], ["K.Đào", "Bình"]),
        (3, ["Tâm", "Hồng"], ["T.Huy", "Mindy"]),
    ]),
]

sql_lines = []
sql_lines.append("-- Seed script for Trusting Social Badminton Tournament")
sql_lines.append(f"-- Tournament ID: {tournament_id}\n")
sql_lines.append("DO $$")
sql_lines.append("DECLARE")
sql_lines.append(f"  v_tourney_id uuid := '{tournament_id}';")
sql_lines.append("  v_group_id uuid;")
for i in range(1, 7):
    sql_lines.append(f"  v_team_{i} uuid;")
for t in teams_data:
    t_num = t["num"]
    for p_name, _ in t["players"]:
        safe_p = p_name.replace(".", "_").replace(" ", "_")
        sql_lines.append(f"  v_p_{t_num}_{safe_p} uuid;")
sql_lines.append("  v_tie_id uuid;")
sql_lines.append("  v_rub_1 uuid; v_rub_2 uuid; v_rub_3 uuid;")
sql_lines.append("BEGIN")

# 1. Group
sql_lines.append("\n  -- 1. Tạo hoặc lấy Bảng A")
sql_lines.append("  SELECT id INTO v_group_id FROM public.tournament_groups WHERE tournament_id = v_tourney_id AND name = 'Bảng A' LIMIT 1;")
sql_lines.append("  IF v_group_id IS NULL THEN")
sql_lines.append("    INSERT INTO public.tournament_groups(tournament_id, name, sort_order)")
sql_lines.append("    VALUES (v_tourney_id, 'Bảng A', 1)")
sql_lines.append("    RETURNING id INTO v_group_id;")
sql_lines.append("  END IF;\n")

# 2. Teams
sql_lines.append("  -- 2. Tạo 6 Đội")
for t in teams_data:
    num = t["num"]
    name = t["name"]
    short_name = t["short_name"]
    emoji = t["emoji"]
    sql_lines.append(f"  SELECT id INTO v_team_{num} FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = '{short_name}' LIMIT 1;")
    sql_lines.append(f"  IF v_team_{num} IS NULL THEN")
    sql_lines.append(f"    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)")
    sql_lines.append(f"    VALUES (v_tourney_id, v_group_id, '{name}', '{short_name}', '{emoji}', {num})")
    sql_lines.append(f"    RETURNING id INTO v_team_{num};")
    sql_lines.append("  ELSE")
    sql_lines.append(f"    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '{emoji}', name = '{name}', seed = {num} WHERE id = v_team_{num};")
    sql_lines.append("  END IF;")

# 3. Players
sql_lines.append("\n  -- 3. Tạo Vận động viên cho từng đội")
for t in teams_data:
    t_num = t["num"]
    sql_lines.append(f"\n  -- VĐV Đội {t_num}")
    for idx, (p_name, gender) in enumerate(t["players"]):
        safe_p = p_name.replace(".", "_").replace(" ", "_")
        var_name = f"v_p_{t_num}_{safe_p}"
        sql_lines.append(f"  SELECT id INTO {var_name} FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_{t_num} AND full_name = '{p_name}' LIMIT 1;")
        sql_lines.append(f"  IF {var_name} IS NULL THEN")
        sql_lines.append(f"    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)")
        sql_lines.append(f"    VALUES (v_tourney_id, v_team_{t_num}, '{p_name}', '{gender}', {idx + 1})")
        sql_lines.append(f"    RETURNING id INTO {var_name};")
        sql_lines.append("  END IF;")

# 4. Ties and Lineups
sql_lines.append("\n  -- 4. Tạo 15 Trận đồng đội (Ties) và Lineup theo ma trận")
for tie_idx, (tA, tB, rubbers) in enumerate(matchups, 1):
    sql_lines.append(f"\n  -- Tie #{tie_idx}: Đội {tA} vs Đội {tB}")
    sql_lines.append(f"  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_{tA} AND team_b_id = v_team_{tB}) OR (team_a_id = v_team_{tB} AND team_b_id = v_team_{tA})) LIMIT 1;")
    sql_lines.append("  IF v_tie_id IS NULL THEN")
    sql_lines.append("    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)")
    sql_lines.append(f"    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội {tA} vs Đội {tB}', {tie_idx}, v_team_{tA}, v_team_{tB}, 'Sân 1, 2, 3')")
    sql_lines.append("    RETURNING id INTO v_tie_id;")
    sql_lines.append("  END IF;\n")

    # Update rubbers court
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;")
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;")
    sql_lines.append("  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;")

    # Lineups for each rubber
    for pos, sideA_players, sideB_players in rubbers:
        rub_var = f"v_rub_{pos}"
        # Side A
        for p in sideA_players:
            safe_p = p.replace(".", "_").replace(" ", "_")
            p_var = f"v_p_{tA}_{safe_p}"
            sql_lines.append(f"  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, {rub_var}, 'a', {p_var}) ON CONFLICT DO NOTHING;")
        # Side B
        for p in sideB_players:
            safe_p = p.replace(".", "_").replace(" ", "_")
            p_var = f"v_p_{tB}_{safe_p}"
            sql_lines.append(f"  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, {rub_var}, 'b', {p_var}) ON CONFLICT DO NOTHING;")

sql_lines.append("\n  RAISE NOTICE 'Đã seed thành công 6 đội, 36 vận động viên, 15 trận đồng đội và toàn bộ đội hình cho giải %!', v_tourney_id;")
sql_lines.append("END $$;")

with open('supabase/seed_ts_tournament.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines) + '\n')

print("Generated supabase/seed_ts_tournament.sql successfully!")
